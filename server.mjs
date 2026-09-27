import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Mizzanje AI está online!");
});

app.post("/conversar", async (req, res) => {
  try {
    const mensagem = req.body.mensagem;

    if (!mensagem) {
      return res.status(400).json({
        erro: "Nenhuma mensagem recebida."
      });
    }

    const response = await openai.responses.create({
      model: "gpt-6-astra",
      instructions:
        "Você é Mizzanje, um assistente virtual pessoal. Responda sempre em português do Brasil, de forma natural, amigável e objetiva. Você conversa com o usuário e futuramente também ajudará a organizar lembretes.",
      input: mensagem
    });

    res.json({
      resposta: response.output_text
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao conversar com a IA."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Mizzanje AI rodando na porta ${PORT}`);
});
