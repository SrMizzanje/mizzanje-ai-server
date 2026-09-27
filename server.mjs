import express from "express";

const app = express();

// Permite receber dados em JSON
app.use(express.json());

// ========================================
// CONFIGURAÇÃO DO GEMINI
// ========================================

// A chave está armazenada com segurança no Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Modelo usado pelo Mizzanje
const GEMINI_MODEL = "gemini-3.5-flash-lite";

// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {

    res.send("Mizzanje AI está online com Gemini!");

});

// ========================================
// ROTA DE CONVERSA
// ========================================

app.post("/conversar", async (req, res) => {

    try {

        // ========================================
        // VERIFICA A CHAVE
        // ========================================

        if (!GEMINI_API_KEY) {

            console.error("GEMINI_API_KEY não encontrada.");

            return res.status(500).json({
                erro: "A chave GEMINI_API_KEY não está configurada no servidor."
            });

        }

        // ========================================
        // RECEBE A MENSAGEM
        // ========================================

        const mensagem = req.body.mensagem;

        if (!mensagem || typeof mensagem !== "string") {

            return res.status(400).json({
                erro: "Nenhuma mensagem válida foi recebida."
            });

        }

        console.log("Mensagem recebida pelo Mizzanje.");

        // ========================================
        // PERSONALIDADE DO MIZZANJE
        // ========================================

        const instrucao = `
Você é Mizzanje, um assistente virtual pessoal.

Seu nome é Mizzanje.

Converse sempre em português do Brasil.

Responda de maneira natural, amigável e objetiva.

Você está sendo utilizado através de um assistente por voz
instalado em um celular Android.

Suas respostas normalmente serão lidas em voz alta pelo celular.

Por isso:

- Evite respostas desnecessariamente longas.
- Use linguagem natural.
- Evite formatação complicada.
- Não use tabelas quando não forem necessárias.
- Não fique repetindo que você é uma inteligência artificial.
- Quando não souber alguma coisa, diga claramente que não sabe.
- Nunca invente informações.

Você pode conversar, responder perguntas, explicar assuntos
e ajudar o usuário em tarefas do cotidiano.

Futuramente o aplicativo poderá executar ações como:
criar lembretes, alarmes e outras funções no celular.

Mensagem do usuário:

${mensagem}
`;

        // ========================================
        // ENVIA PARA O GEMINI
        // ========================================

        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

        const respostaGemini = await fetch(url, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "x-goog-api-key": GEMINI_API_KEY

            },

            body: JSON.stringify({

                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text: instrucao
                            }
                        ]
                    }
                ]

            })

        });

        // ========================================
        // LÊ A RESPOSTA DO GOOGLE
        // ========================================

        const dados = await respostaGemini.json();

        // ========================================
        // VERIFICA ERROS DO GEMINI
        // ========================================

        if (!respostaGemini.ok) {

            console.error(
                "Erro retornado pelo Gemini:",
                JSON.stringify(dados)
            );

            return res.status(respostaGemini.status).json({

                erro: "Erro ao acessar o Gemini",

                status: respostaGemini.status,

                mensagem:
                    dados?.error?.message ||
                    "Erro desconhecido retornado pelo Gemini."

            });

        }

        // ========================================
        // PEGA O TEXTO GERADO
        // ========================================

        const resposta =
            dados?.candidates?.[0]?.content?.parts
                ?.map(parte => parte.text || "")
                .join("")
                .trim();

        // ========================================
        // VERIFICA SE VEIO UMA RESPOSTA
        // ========================================

        if (!resposta) {

            console.error(
                "Gemini não retornou texto:",
                JSON.stringify(dados)
            );

            return res.status(500).json({

                erro: "O Gemini não retornou uma resposta em texto."

            });

        }

        console.log("Mizzanje respondeu com sucesso.");

        // ========================================
        // DEVOLVE PARA O CELULAR
        // ========================================

        return res.json({

            resposta: resposta

        });

    } catch (error) {

        // ========================================
        // ERRO GERAL
        // ========================================

        console.error("Erro no servidor:", error);

        return res.status(500).json({

            erro: "Erro interno do servidor.",

            mensagem:
                error?.message ||
                "Erro desconhecido."

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
    console.log("IA: Google Gemini");
    console.log(`Modelo: ${GEMINI_MODEL}`);
    console.log(`Porta: ${PORT}`);
    console.log("--------------------------------------");

});
