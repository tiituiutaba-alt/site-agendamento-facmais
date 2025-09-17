// Local do arquivo: netlify/functions/agendar.js

const { google } = require("googleapis");
const credentials = require("../../credenciais.json");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { dataAgendamento, horario, nomeAluno, emailAluno, telefoneAluno, motivo, coordenadorEmail, cursoNome } = JSON.parse(event.body);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const impersonatedAuth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
      subject: coordenadorEmail, // Atuar em nome do e-mail do coordenador
    });

    const calendar = google.calendar({ version: "v3", auth: impersonatedAuth });

    const [hora, minuto] = horario.split(':');
    // Ajuste para garantir que a data seja interpretada corretamente sem fuso horário local do servidor
    const dataISO = `${dataAgendamento}T${hora}:${minuto}:00`;
    const dataInicio = new Date(dataISO);

    // Duração padrão de 30 minutos para o evento
    const dataFim = new Date(dataInicio.getTime() + 30 * 60 * 1000); 

    const evento = {
      summary: `Atendimento Aluno: ${nomeAluno} - ${cursoNome}`,
      description: `<b>Motivo do Agendamento:</b> ${motivo}\n\n<b>E-mail:</b> ${emailAluno}\n<b>Telefone:</b> ${telefoneAluno}`,
      start: {
        dateTime: dataInicio.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: dataFim.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      attendees: [
        { email: emailAluno, displayName: nomeAluno },
        { email: coordenadorEmail }
      ],
      reminders: {
        useDefault: true,
      },
    };

    await calendar.events.insert({
      calendarId: "primary", // Insere na agenda principal do coordenador
      resource: evento,
      sendUpdates: "all" // Envia convite por e-mail para todos os convidados
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Agendamento criado com sucesso!" }),
    };
  } catch (error) {
    console.error("Erro ao criar evento na agenda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro ao agendar. Detalhes: " + error.message }),
    };
  }
};