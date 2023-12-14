const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.json());

// Configuração do Knex
const knex = require('knex');
const knexConfig = require('./knexfile');
const db = knex(knexConfig);

app.get('/listagem-ingressos', async (req, res) => {
  try {
    const { startDate } = req.query;

    let query = db('tickets_und').select(['date', 'created_at', 'filial', 'price', 'ticket_time', 'status']);

    if (startDate) {
      query = query.where('date', '=', startDate).orWhereRaw("DATE(created_at AT TIME ZONE 'UTC') = ?", [startDate]);
    }

    const tickets = await query;
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ingressos' });
  }
});


app.get('/contagem-ingressos-status', async (req, res) => {
  try {
    const countByStatus = await db('tickets_und')
      .select('status')
      .count('status as count')
      .min('date as date')
      .max('created_at as created_at')
      .groupBy('status');

    res.json(countByStatus);
  } catch (error) {
    console.error('Erro ao contar ingressos por status', error);
    res.status(500).json({ error: 'Erro ao contar ingressos por status' });
  }
});



app.get('/contagem-ingressos-unidade', async (req, res) => {
  try {
    const countByUnity = await db('unities')
      .join('tickets_und', 'unities.var_name', '=', 'tickets_und.filial')
      .select('unities.var_name as unity_name')
      .count('tickets_und.id as count')
      .groupBy('unities.var_name');

    res.json(countByUnity);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao contar ingressos por unidade' });
  }
});


app.get('/soma-total-vendas-unidade', async (req, res) => {
  try {
    const totalSalesByUnity = await db('unities')
      .join('tickets_und', 'unities.var_name', '=', 'tickets_und.filial')
      .select('unities.var_name as unity_name')
      .sum('tickets_und.price as totalSales')
      .groupBy('unities.var_name');

    res.json(totalSalesByUnity);
  } catch (error) {
    console.error('Erro ao somar o total de vendas por unidade', error);
    res.status(500).json({ error: 'Erro ao somar o total de vendas por unidade' });
  }
});


app.get('/contagem-ingressos-usuario', async (req, res) => {
  try {
    const countByUser = await db('tickets_und')
      .join('users', 'tickets_und.client_id', '=', 'users.id') // Ajuste aqui para usar client_id
      .select('users.email as user', db.raw('count(*) as count'))
      .groupBy('users.email');
    res.json(countByUser);
  } catch (error) {
    console.error('Erro ao contar ingressos por usuário', error);
    res.status(500).json({ error: 'Erro ao contar ingressos por usuário' });
  }
});

app.get('/listagem-horarios', async (req, res) => {
  try {
    const { data = new Date().toISOString().split('T')[0] } = req.query;
    const schedules = await db('templates')
      .select('*')
      .where('date', '=', data);

    res.json(schedules);
  } catch (error) {
    console.error('Erro ao buscar os horários', error);
    res.status(500).json({ error: 'Erro ao buscar os horários' });
  }
});


app.get('/datas', async (req, res) => {
  try {
    const { email } = req.query;
    const userTickets = await db('tickets_und')
      .select(
        'tickets_und.date',
        'tickets_und.filial',
        'tickets_und.ticket_time',
        'tickets_und.duration',
        'users.email'
      )
      .leftJoin('users', 'tickets_und.client_id', 'users.id')
      .where('users.email', '=', email);

    res.json(userTickets);
  } catch (error) {
    console.error('Erro ao obter ingressos por usuário', error);
    res.status(500).json({ error: 'Erro ao obter ingressos por usuário' });
  }
});

app.listen(port,'0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
