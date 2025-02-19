###########################################################
# Base Python image. Set shared environment variables.
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

###########################################################
# Builder stage. Build dependencies.
FROM base AS builder
RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        build-essential \
        curl \
        vim \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./pyproject.toml ./uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

###########################################################
# Production stage. Copy only runtime deps that were installed in the Builder stage.
FROM python:3.13-slim-bookworm AS production

# Copy the application from the builder
COPY --from=builder --chown=app:app /app /app

# Create user with the name uv
RUN groupadd -g 1500 uv && \
    useradd -m -u 1500 -g uv uv

# Ensure /app/data directory exists and is writable
RUN mkdir -p /app/data && chown -R uv:uv /app/data

USER uv
WORKDIR /app

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
CMD ["gunicorn", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "1", "src.app:app", "--timeout", "300"]
