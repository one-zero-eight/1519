import mimetypes
import os
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, Request, UploadFile
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from sqlalchemy.orm import Session

from src.config import settings
from src.models import Application, get_db_session
from src.pydantic_base import BaseSchema
from src.schemas import ApplicationResponse

router = APIRouter(prefix="/applicant", tags=["Applicant"], route_class=AutoDeriveResponsesAPIRoute)


class SubmitForm(BaseSchema):
    email: str = Form(
        ...,
        description="Innopolis email of the participant (...@innopolis.university or ...@innopolis.ru)",
        pattern=r"^[a-zA-Z0-9_.+-]+@(innopolis\.(university|ru))$",
        min_length=1,
        examples=["i.ivanov@innopolis.university"],
    )
    full_name: str = Form(..., description="Full name of the participant", min_length=1, examples=["Ivan Ivanov"])
    cv_file: UploadFile = Form(None, description="CV of the participant")
    transcript_file: UploadFile = Form(None, description="Transcript of the participant")
    motivational_letter_file: UploadFile = Form(None, description="Motivational letter of the participant")
    recommendation_letter_file: UploadFile = Form(None, description="Recommendation letter of the participant")
    almost_a_student_file: UploadFile = Form(None, description='"Almost A student" document of the participant')


@router.post("/submit/")
async def submit_application_route(
    request: Request,
    form: Annotated[SubmitForm, Form(media_type="multipart/form-data")],
    session: Session = Depends(get_db_session),
) -> ApplicationResponse:
    """
    Submit an application or update an existing one (if the email is the same)
    """

    # check if application with such email already exists
    existing = session.query(Application).filter(Application.email == form.email).first()
    if existing is not None and existing.session_id != request.session.get("session_id"):
        raise HTTPException(400, f"Application with email {form.email} already exists and belongs to another user")

    # check if applicant has already submitted an application
    application_same_sessions = (
        session.query(Application).filter(Application.session_id == request.session.get("session_id")).count()
    )
    if (application_same_sessions >= 1 and existing is None) or application_same_sessions > 1:
        raise HTTPException(400, "You have already submitted an application")

    on_fs_filenames = {
        "cv.pdf": None,
        "transcript.xlsx": None,
        "motivational-letter.pdf": None,
        "recommendation-letter.pdf": None,
        "almost-a-student.pdf": None,
    }

    for uploaded, filename_template in [
        (form.cv_file, "cv.pdf"),
        (form.transcript_file, "transcript.xlsx"),
        (form.motivational_letter_file, "motivational-letter.pdf"),
        (form.recommendation_letter_file, "recommendation-letter.pdf"),
        (form.almost_a_student_file, "almost-a-student.pdf"),
    ]:
        if uploaded is None:
            continue
        filename = filename_template.format(email=form.email)
        # check if file is in correct type
        needed_content_type, _ = mimetypes.guess_type(filename)
        if uploaded.content_type != needed_content_type:
            raise HTTPException(
                400, f"File {uploaded.filename} should be of type {needed_content_type} but is {uploaded.content_type}"
            )

        file_path = settings.files_dir / form.email / filename
        os.makedirs(file_path.parent, exist_ok=True)
        file_path.write_bytes(uploaded.file.read())
        uploaded.file.close()
        on_fs_filenames[filename_template] = file_path.relative_to(settings.files_dir).as_posix()

    # save application to database
    if existing is None:
        application = Application(
            email=form.email,
            session_id=request.session.get("session_id"),
            full_name=form.full_name,
            cv=on_fs_filenames["cv.pdf"],
            transcript=on_fs_filenames["transcript.xlsx"],
            motivational_letter=on_fs_filenames["motivational-letter.pdf"],
            recommendation_letter=on_fs_filenames["recommendation-letter.pdf"],
            almost_a_student=on_fs_filenames["almost-a-student.pdf"],
        )
        session.add(application)
    else:
        existing.full_name = form.full_name
        if on_fs_filenames["cv.pdf"]:
            existing.cv = on_fs_filenames["cv.pdf"]
        if on_fs_filenames["transcript.xlsx"]:
            existing.transcript = on_fs_filenames["transcript.xlsx"]
        if on_fs_filenames["motivational-letter.pdf"]:
            existing.motivational_letter = on_fs_filenames["motivational-letter.pdf"]
        if on_fs_filenames["recommendation-letter.pdf"]:
            existing.recommendation_letter = on_fs_filenames["recommendation-letter.pdf"]
        if on_fs_filenames["almost-a-student.pdf"]:
            existing.almost_a_student = on_fs_filenames["almost-a-student.pdf"]
        application = existing

    session.commit()

    return ApplicationResponse.model_validate(application, from_attributes=True)


@router.get("/my-application/")
async def my_application_route(request: Request, session: Session = Depends(get_db_session)) -> ApplicationResponse:
    """
    Get the applications of the current user
    """
    application = session.query(Application).filter(Application.session_id == request.session.get("session_id")).first()
    if application is None:
        raise HTTPException(404, "Application not found")
    return ApplicationResponse.model_validate(application, from_attributes=True)
