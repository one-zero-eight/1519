import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from starlette.responses import FileResponse

import src.logging_  # noqa: F401
from src.config import settings
from src.db.models import Patron
from src.dependencies import patron_auth
from src.logging_ import logger

router = APIRouter(
    prefix="/files",
    tags=["Files"],
    route_class=AutoDeriveResponsesAPIRoute,
)


def is_subpath(subpath: Path, path: Path) -> bool:
    """https://stackoverflow.com/a/37095733"""
    parent_path = os.path.abspath(path)
    child_path = os.path.abspath(subpath)
    return os.path.commonpath([parent_path]) == os.path.commonpath([parent_path, child_path])


@router.get("/{relative_path:path}", response_class=FileResponse)
def file_route(relative_path: str, request: Request, _: Patron = Depends(patron_auth)) -> FileResponse:
    path = settings.files_dir / relative_path
    if not is_subpath(path, settings.files_dir):
        raise HTTPException(status_code=404, detail="Path not in static files folder.")
    logger.info(request.headers)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    filename = path.parent.name + "_" + path.name
    ref = request.headers.get("referer")
    if ref and "/docs" in ref:  # Avoid Swagger crashing when trying to display a file
        content_disposition_type = "attachment"
    else:
        content_disposition_type = "inline"

    return FileResponse(path, filename=filename, content_disposition_type=content_disposition_type)
