import express from "express";

const app = express();

// Permite receber dados em JSON
app.use(express.json());

// ========================================
// CONFIGURAÇÃO DO GEMINI
// ========================================

// A chave está armazenada com segurança no Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Mantemos exatamente o modelo que já está funcionando no servidor
const GEMINI_MODEL = "gemini-3.5-flash-lite";

// ========================================
// FUNÇÃO PARA CHAMAR O GEMINI
// ========================================

async function chamarGemini(instrucao) {

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

    const dados =
        await respostaGemini.json();

    if (!respostaGemini.ok) {

        const erro = new Error(
            dados?.error?.message ||
            "Erro desconhecido retornado pelo Gemini."
        );

        erro.status =
            respostaGemini.status;

        throw erro;
    }

    const resposta =
        dados?.candidates?.[0]?.content?.parts
            ?.map(parte => parte.text || "")
            .join("")
            .trim();

    if (!resposta) {

        throw new Error(
            "O Gemini não retornou uma resposta em texto."
        );
    }

    return resposta;
}

// ========================================
// VERIFICA SE A CHAVE EXISTE
// ========================================

function verificarChave(res) {

    if (!GEMINI_API_KEY) {

        console.error(
            "GEMINI_API_KEY não encontrada."
        );

        res.status(500).json({

            erro:
                "A chave GEMINI_API_KEY não está configurada no servidor."

        });

        return false;
    }

    return true;
}

// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {

    res.send(
        "Mizzanje AI está online com Gemini!"
    );

});

// ========================================
// ROTA DE CONVERSA
// ========================================

app.post("/conversar", async (req, res) => {

    try {

        if (!verificarChave(res)) {

            return;
        }

        const mensagem =
            req.body.mensagem;

        if (
            !mensagem ||
            typeof mensagem !== "string"
        ) {

            return res.status(400).json({

                erro:
                    "Nenhuma mensagem válida foi recebida."

            });
        }

        console.log(
            "Mensagem recebida pelo Mizzanje."
        );

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

O aplicativo também possui um sistema separado para executar
lembretes no celular.

Mensagem do usuário:

${mensagem}
`;

        const resposta =
            await chamarGemini(
                instrucao
            );

        console.log(
            "Mizzanje respondeu com sucesso."
        );

        return res.json({

            resposta: resposta

        });

    } catch (error) {

        console.error(
            "Erro no servidor:",
            error
        );

        return res.status(
            error?.status || 500
        ).json({

            erro:
                "Erro ao acessar o Gemini.",

            mensagem:
                error?.message ||
                "Erro desconhecido."

        });
    }

});

// ========================================
// ROTA PARA INTERPRETAR LEMBRETES
// ========================================

app.post(
    "/interpretar-lembrete",
    async (req, res) => {

        try {

            if (!verificarChave(res)) {

                return;
            }

            const mensagem =
                req.body.mensagem;

            const dataHoraAtual =
                req.body.dataHoraAtual;

            const fusoHorario =
                req.body.fusoHorario ||
                "America/Bahia";

            if (
                !mensagem ||
                typeof mensagem !== "string"
            ) {

                return res.status(400).json({

                    erro:
                        "Mensagem do lembrete não recebida."

                });
            }

            if (
                !dataHoraAtual ||
                typeof dataHoraAtual !== "string"
            ) {

                return res.status(400).json({

                    erro:
                        "Data e hora atuais não recebidas."

                });
            }

            console.log(
                "Interpretando lembrete."
            );

            const instrucao = `
Você trabalha como interpretador de comandos de lembrete
para um aplicativo Android chamado Mizzanje.

Sua única tarefa é interpretar o pedido do usuário.

DATA E HORA ATUAIS DO CELULAR:

${dataHoraAtual}

FUSO HORÁRIO DO CELULAR:

${fusoHorario}

PEDIDO DO USUÁRIO:

${mensagem}

Converta o pedido para uma data e hora absoluta.

Entenda expressões naturais em português do Brasil, como:

"hoje às 20 horas"

"amanhã às 8"

"amanhã às 8 da manhã"

"amanhã às 8 da noite"

"daqui a 30 minutos"

"daqui a 2 horas"

"segunda-feira às 9"

"sábado às 14 horas"

"dia 5 às 10"

"dia 5 do mês que vem às 10"

Extraia também aquilo que o usuário deseja lembrar.

IMPORTANTE:

Se o usuário não estiver pedindo um lembrete,
retorne valido como false.

Se não for possível determinar uma data e hora,
retorne valido como false.

Nunca invente um horário que o usuário não informou.

Quando o usuário informar apenas um horário, como
"me lembre às 18 horas", escolha a próxima ocorrência
futura desse horário.

Quando o usuário informar um dia da semana,
escolha a próxima ocorrência futura desse dia.

A dataHora deve estar no formato:

AAAA-MM-DDTHH:MM:SS

Exemplo:

2026-09-27T08:00:00

Responda SOMENTE com JSON válido.

Não use Markdown.

Não use blocos de código.

Não escreva nenhuma explicação antes ou depois.

Formato obrigatório:

{
  "valido": true,
  "dataHora": "2026-09-27T08:00:00",
  "mensagem": "ligar para o cliente"
}

Se não conseguir interpretar:

{
  "valido": false,
  "dataHora": "",
  "mensagem": ""
}
`;

            const textoGemini =
                await chamarGemini(
                    instrucao
                );

            // Remove eventual bloco Markdown caso
            // o modelo não siga perfeitamente a instrução.
            const textoLimpo =
                textoGemini
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

            let lembrete;

            try {

                lembrete =
                    JSON.parse(
                        textoLimpo
                    );

            } catch (erroJson) {

                console.error(
                    "JSON de lembrete inválido:",
                    textoGemini
                );

                return res.status(500).json({

                    erro:
                        "Não foi possível interpretar o lembrete.",

                    mensagem:
                        "O Gemini retornou um formato inválido."

                });
            }

            const valido =
                lembrete?.valido === true;

            if (!valido) {

                return res.json({

                    valido: false,

                    dataHora: "",

                    mensagem: ""

                });
            }

            if (
                typeof lembrete.dataHora !==
                "string" ||
                !lembrete.dataHora
            ) {

                return res.json({

                    valido: false,

                    dataHora: "",

                    mensagem: ""

                });
            }

            if (
                typeof lembrete.mensagem !==
                "string" ||
                !lembrete.mensagem.trim()
            ) {

                return res.json({

                    valido: false,

                    dataHora: "",

                    mensagem: ""

                });
            }

            console.log(
                "Lembrete interpretado com sucesso."
            );

            return res.json({

                valido: true,

                dataHora:
                    lembrete.dataHora,

                mensagem:
                    lembrete.mensagem.trim()

            });

        } catch (error) {

            console.error(
                "Erro ao interpretar lembrete:",
                error
            );

            return res.status(
                error?.status || 500
            ).json({

                erro:
                    "Erro ao interpretar o lembrete.",

                mensagem:
                    error?.message ||
                    "Erro desconhecido."

            });
        }
    }
);

// ========================================
// INICIA O SERVIDOR
// ========================================

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "--------------------------------------"
        );

        console.log(
            "Mizzanje AI iniciado!"
        );

        console.log(
            "IA: Google Gemini"
        );

        console.log(
            `Modelo: ${GEMINI_MODEL}`
        );

        console.log(
            `Porta: ${PORT}`
        );

        console.log(
            "--------------------------------------"
        );
    }
);
