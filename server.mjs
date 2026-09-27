import express from "express";
import OpenAI from "openai";

const app = express();

// Permite receber JSON
app.use(express.json());

// ========================================
// OPENAI
// ========================================
// A chave fica armazenada no Render.
// NÃO coloque a chave sk-... neste arquivo.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ========================================
// ROTA PRINCIPAL
// ========================================
// Serve para verificar se o servidor está funcionando.
app.get("/", (req, res) => {

    res.send("Mizzanje AI está online!");

});

// ========================================
// ROTA DE CONVERSA
// ========================================
app.post("/conversar", async (req, res) => {

    try {

        // Recebe a mensagem enviada pelo celular
        const mensagem = req.body.mensagem;

        // Verifica se existe uma mensagem
        if (!mensagem) {

            return res.status(400).json({
                erro: "Nenhuma mensagem recebida."
            });

        }

        console.log("Mensagem recebida:", mensagem);

        // ========================================
        // ENVIA A PERGUNTA PARA A OPENAI
        // ========================================

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

Você pode conversar com o usuário, responder perguntas,
explicar assuntos e ajudar a organizar atividades.

Quando não souber alguma informação, diga claramente que
não sabe em vez de inventar uma resposta.

Futuramente você também poderá criar lembretes,
alarmes e executar outras funções no celular.
`,

            input: mensagem

        });

        // ========================================
        // PEGA A RESPOSTA
        // ========================================

        const resposta = response.output_text;

        console.log("Resposta do Mizzanje:", resposta);

        // Envia a resposta para o aplicativo
        return res.json({
            resposta: resposta
        });

    } catch (error) {

        // ========================================
        // MOSTRA O ERRO PARA DIAGNÓSTICO
        // ========================================

        console.error("Erro OpenAI:", error);

        return res.status(500).json({

            erro: "Erro na OpenAI",

            mensagem:
                error?.message ||
                "Erro desconhecido ao acessar a OpenAI.",

            status:
                error?.status ||
                null,

            codigo:
                error?.code ||
                null

        });

    }

});

// ========================================
// INICIA O SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log("--------------------------------------");
    console.log("Mizzanje AI iniciado!");
    console.log(`Porta: ${PORT}`);
    console.log("--------------------------------------");

});
