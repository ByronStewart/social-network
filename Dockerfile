FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt --no-cache
COPY . /code/
RUN python manage.py collectstatic --no-input && python manage.py migrate
CMD gunicorn project4.wsgi 0.0.0.0:$PORT


