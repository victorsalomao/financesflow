# Instala dependencias e inicia o servico IA
pip install -r requirements.txt
$port = if ($env:PORT) { $env:PORT } else { "8000" }
uvicorn main:app --host 0.0.0.0 --port $port --reload
