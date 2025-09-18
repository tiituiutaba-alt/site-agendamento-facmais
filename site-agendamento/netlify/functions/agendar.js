// Local do arquivo: netlify/functions/agendar.js - VERSÃO COM VERIFICAÇÃO DE CONFLITOS

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
    const dataISO = `${dataAgendamento}T${hora}:${minuto}:00-03:00`;
    const dataInicio = new Date(dataISO);
    const dataFim = new Date(dataInicio.getTime() + 30 * 60 * 1000);

    // ##### INÍCIO DA NOVA VERIFICAÇÃO DE CONFLITOS #####
    const checkResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: dataInicio.toISOString(),
      timeMax: dataFim.toISOString(),
      maxResults: 1, // Só precisamos saber se existe pelo menos 1 evento
      singleEvents: true,
    });

    if (checkResponse.data.items.length > 0) {
      // Se a lista de eventos não estiver vazia, significa que o horário já está ocupado.
      console.log('Conflito de agendamento detectado.');
      return {
        statusCode: 409, // 409 é o código para "Conflito"
        body: JSON.stringify({ message: "Este horário já foi agendado." }),
      };
    }
    // ##### FIM DA NOVA VERIFICAÇÃO DE CONFLITOS #####

    const evento = {
      summary: `Atendimento Aluno: ${nomeAluno} - ${cursoNome}`,
      description: `<b>Motivo do Agendamento:</b> ${motivo}\n\n<b>E-mail:</b> ${emailAluno}\n<b>Telefone:</b> ${telefoneAluno}`,
      start: { dateTime: dataInicio.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: dataFim.toISOString(), timeZone: "America/Sao_Paulo" },
      attendees: [
        { email: emailAluno, displayName: nomeAluno, responseStatus: 'accepted' },
        { email: coordenadorEmail, responseStatus: 'accepted' }
      ],
      reminders: { useDefault: true },
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
