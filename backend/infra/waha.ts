


// Conexão com a Waha e serviços relacionados as mensagens;


// Configuração do WAHA
const WAHA_URL = 'http://localhost:3000'; // URL do seu servidor WAHA
const SESSION_NAME = 'default'; // Nome da sua sessão

interface SendTextMessageParams {
    telefone: string;
    text: string;
    session?: string;
}

// Função para enviar mensagem de texto
export async function sendTextMessage({ telefone, text, session = SESSION_NAME }: SendTextMessageParams) {
    try {
        const chatId = `${telefone.replace(/\D/g, '') // Remove caracteres não numéricos
            }@c.us`; // Formato esperado pelo WAHA

        const response = await fetch(`${WAHA_URL}/api/sendText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatId, text, session }),
        });

        const data = await response.json();

        console.log('Mensagem enviada com sucesso:', data);
        return data;
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
}

