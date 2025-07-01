from fastapi import Form, UploadFile

from src.schemas.pydantic_base import BaseSchema


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
