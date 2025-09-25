from flask import Flask, request, jsonify
from rag_chain import get_rag_chain
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "http://localhost:5173"}})

qa_chain = get_rag_chain()

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "No query provided"}), 400

    try:
        response = qa_chain.invoke({"query": query})

        answer = response["result"]
        sources = [doc.metadata.get("question") for doc in response["source_documents"]]

        return jsonify({
            "answer": answer,
            "sources": sources
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
