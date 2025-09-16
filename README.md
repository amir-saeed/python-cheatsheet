# python-cheatsheet

python3 -m venv .venv
source .venv/bin/activate

pip freeze > requirements.txt

pip show pydantic

uvicorn main:app --reload --host 0.0.0.0 --port 8000

uvicorn main:app --reload