FROM public.ecr.aws/lambda/python:3.12.2024.03.21.19-x86_64

ARG NILLION_SDK_ROOT

COPY ${NILLION_SDK_ROOT} /opt/nillion-sdk
RUN dnf install --assumeyes gcc git gzip tar && dnf --assumeyes clean all

RUN tar -xzf /opt/nillion-sdk/nillion-sdk-bins-x86_64-unknown-linux-musl.tar.gz --strip-components=1 -C "${LAMBDA_TASK_ROOT}" x86_64-unknown-linux-musl/pynadac

COPY app.py .
COPY remote.json .

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && pip install -r requirements.txt

CMD ["app.handler"]

