import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json());

// Chave da OpenAI será lida do Render.
// NÃO coloque sua chave diretamente neste código.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Rota para verificar se o servidor está funcionando
app.get("/", (req, res) => {
    res.send("Mizzanje AI está online!");
});

// Rota principal de conversa
app.post("/conversar", async (req, res) => {

    try {

        const mensagem = req.body.mensagem;

        if (!mensagem) {
            return res.status(400).json({
                erro: "Nenhuma mensagem recebida."
            });
        }

        console.log("Mensagem recebida:", mensagem);

        const response = await openai.responses.create({

            model: "gpt-5.4-mini",

            instructions: `
Você é Mizzanje, um assistente virtual pessoal.

Seu nome é Mizzanje.

Converse sempre em português do Brasil.

Responda de maneira natural, amigável e objetiva.

Você está sendo usado através de um assistente por voz
instalado em um celular Android.

Como suas respostas normalmente serão faladas em voz alta,
evite respostas desnecessariamente longas.

Você pode conversar, responder perguntas e ajudar o usuário
a organizar suas atividades.

Futuramente você também poderá criar lembretes e executar
outras funções no celular.
`,

            input: mensagem
        });

        const resposta = response.output_text;

        console.log("Resposta:", resposta);

        res.json({
            resposta: resposta
        });

    } catch (error) {

        console.error("Erro OpenAI:", error);

        res.status(500).json({
            erro: "Não consegui conversar com a IA neste momento."
        });

    }

});

// Porta fornecida pelo Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mizzanje AI está rodando na porta ${PORT}`);
});
