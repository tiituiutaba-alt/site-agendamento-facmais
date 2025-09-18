// Local do arquivo: netlify/functions/agendar.js - VERSÃO COM FUSO HORÁRIO CORRIGIDO

const { google } = require("googleapis");
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { dataAgendamento, horario, nomeAluno, emailAluno, telefoneAluno, motivo, coordenadorEmail, cursoNome } = JSON.parse(event.body);

    const impersonatedAuth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
      subject: coordenadorEmail,
    });

    const calendar = google.calendar({ version: "v3", auth: impersonatedAuth });

    const [hora, minuto] = horario.split(':');
    
    // ##### INÍCIO DA CORREÇÃO DE FUSO HORÁRIO #####
    // Adicionamos "-03:00" para especificar que a hora é do fuso horário de Brasília (UTC-3)
    const dataISO = `${dataAgendamento}T${hora}:${minuto}:00-03:00`;
    // ##### FIM DA CORREÇÃO DE FUSO HORÁRIO #####
    
    const dataInicio = new Date(dataISO);

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
      calendarId: "primary",
      resource: evento,
      sendUpdates: "all"
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
