// Local do arquivo: script.js - VERSÃO COM CORREÇÃO DO BUG DE EXIBIÇÃO

document.addEventListener('DOMContentLoaded', function() {

    function gerarHorarios(inicio, fim, intervalo = 30) {
        const horarios = [];
        const [horaInicio, minInicio] = inicio.split(':').map(Number);
        const [horaFim, minFim] = fim.split(':').map(Number);
        let tempoAtual = new Date();
        tempoAtual.setHours(horaInicio, minInicio, 0, 0);
        let tempoFim = new Date();
        tempoFim.setHours(horaFim, minFim, 0, 0);
        while (tempoAtual < tempoFim) {
            horarios.push(
                tempoAtual.getHours().toString().padStart(2, '0') + ':' +
                tempoAtual.getMinutes().toString().padStart(2, '0')
            );
            tempoAtual.setMinutes(tempoAtual.getMinutes() + intervalo);
        }
        return horarios;
    }

    const dadosCoordenadores = [
        { nome: "Getúlio Oliveira Rosa", email: "administracaoitba@facmais.edu.br", curso: "ADM/Contábeis", atendimento: { 3: gerarHorarios('21:00', '22:00') }},
        { nome: "Renato Souza Silva", email: "direitoitba@facmais.edu.br", curso: "Direito", atendimento: { 1: gerarHorarios('20:30', '22:00') }},
        { nome: "Diogo Freire Parreira e Silva", email: "educaitba@facmais.edu.br", curso: "Educação Física", atendimento: { 2: gerarHorarios('20:30', '22:00'), 3: gerarHorarios('19:00', '20:30') }},
        { nome: "Pâmella Arrais Vilela", email: "enfermagemitba@facmais.edu.br", curso: "Enfermagem", atendimento: { 1: gerarHorarios('19:00', '22:00'), 2: gerarHorarios('18:00', '20:15'), 3: gerarHorarios('17:00', '18:50') }},
        { nome: "Gabriel Mairinques Miranda", email: "engcivilitba@facmais.edu.br", curso: "Engenharia Civil", atendimento: { 2: gerarHorarios('20:50', '22:00') }},
        { nome: "Pâmella Arrais Vilela", email: "farmaciaitba@facmais.edu.br", curso: "Farmácia", atendimento: { 1: gerarHorarios('19:00', '22:00') }},
        { nome: "Amanda Cristina Alves de Luz", email: "medveterinariaitba@facmais.edu.br", curso: "Medicina Veterinária", atendimento: { 2: gerarHorarios('18:50', '22:00') }},
        { nome: "Geraldo Lino da Silva Junior", email: "medicina@facmais.edu.br", curso: "Medicina", atendimento: { 1: gerarHorarios('08:00', '12:00'), 3: gerarHorarios('10:00', '12:00'), 4: gerarHorarios('10:00', '12:00') }},
        { nome: "Maria Carliana Mota", email: "nutricaoitba@facmais.edu.br", curso: "Nutrição", atendimento: { 1: gerarHorarios('20:00', '21:00') }},
        { nome: "Dyego Brito Fernandes", email: "odontologiaitba@facmais.edu.br", curso: "Odontologia", atendimento: { 1: gerarHorarios('18:00', '21:00'), 2: gerarHorarios('18:00', '21:00') }},
        { nome: "Marina Gomes de Araujo", email: "psicologiaitba@facmais.edu.br", curso: "Psicologia", atendimento: { 2: gerarHorarios('17:30', '20:35'), 3: gerarHorarios('17:30', '20:35') }},
        { nome: "Atendimento NEIC", email: "neicitba@facmais.edu.br", curso: "NEIC", atendimento: { 4: [...gerarHorarios('15:00', '18:30'), ...gerarHorarios('21:00', '22:00')] }}
    ];

    const nomesDiasSemana = { 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira', 4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado', 0: 'Domingo' };
    const seletorCurso = document.getElementById('seletor-curso');
    const etapaDiaSemana = document.getElementById('etapa-dia-semana');
    // ##### LINHA CORRIGIDA #####
    const divDiasSemana = document.getElementById('dias-semana-disponiveis');
    // ##### FIM DA CORREÇÃO #####
    const etapaHorario = document.getElementById('etapa-horario');
    const seletorDataEspecifica = document.getElementById('seletor-data-especifica');
    const divHorarios = document.getElementById('horarios-disponiveis');
    const etapaDadosPessoais = document.getElementById('etapa-dados-pessoais');
    const motivoTextarea = document.getElementById('motivo');
    const contadorCaracteres = document.getElementById('contador-caracteres');
    const btnAgendar = document.getElementById('btn-agendar');
    let coordenadorSelecionado = null;
    let diaSemanaSelecionado = null;
    let horarioSelecionado = null;

    dadosCoordenadores.forEach((coordenador, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${coordenador.curso} (${coordenador.nome})`;
        seletorCurso.appendChild(option);
    });
    
    seletorCurso.addEventListener('change', function() {
        resetarEtapas(1);
        if (!this.value) return;
        coordenadorSelecionado = dadosCoordenadores[this.value];
        const diasDisponiveis = Object.keys(coordenadorSelecionado.atendimento).sort();
        diasDisponiveis.forEach(dia => {
            const diaBtn = document.createElement('div');
            diaBtn.className = 'botao-selecao';
            diaBtn.textContent = nomesDiasSemana[dia];
            diaBtn.dataset.dia = dia;
            divDiasSemana.appendChild(diaBtn);
            diaBtn.addEventListener('click', function() {
                resetarEtapas(2);
                document.querySelectorAll('#dias-semana-disponiveis .botao-selecao').forEach(b => b.classList.remove('selecionado'));
                this.classList.add('selecionado');
                diaSemanaSelecionado = parseInt(this.dataset.dia);
                popularProximasDatas(diaSemanaSelecionado);
                const horarios = coordenadorSelecionado.atendimento[diaSemanaSelecionado];
                horarios.forEach(horario => {
                    const horarioBtn = document.createElement('div');
                    horarioBtn.className = 'botao-selecao';
                    horarioBtn.textContent = horario;
                    divHorarios.appendChild(horarioBtn);
                    horarioBtn.addEventListener('click', function() {
                        horarioSelecionado = this.textContent;
                        document.querySelectorAll('#horarios-disponiveis .botao-selecao').forEach(b => b.classList.remove('selecionado'));
                        this.classList.add('selecionado');
                        etapaDadosPessoais.classList.remove('hidden');
                        btnAgendar.classList.remove('hidden');
                    });
                });
                etapaHorario.classList.remove('hidden');
            });
        });
        etapaDiaSemana.classList.remove('hidden');
    });
    
    function popularProximasDatas(diaSemana) {
        let hoje = new Date();
        let count = 0;
        seletorDataEspecifica.innerHTML = '';
        while (count < 4) {
            hoje.setDate(hoje.getDate() + 1);
            if (hoje.getDay() === diaSemana) {
                const option = document.createElement('option');
                const valorData = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
                option.value = valorData;
                option.textContent = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
                seletorDataEspecifica.appendChild(option);
                count++;
            }
        }
    }
    
    function resetarEtapas(aPartirDaEtapa) {
        if (aPartirDaEtapa <= 1) {
            etapaDiaSemana.classList.add('hidden');
            divDiasSemana.innerHTML = '';
            coordenadorSelecionado = null;
        }
        if (aPartirDaEtapa <= 2) {
            etapaHorario.classList.add('hidden');
            seletorDataEspecifica.innerHTML = '';
            divHorarios.innerHTML = '';
            diaSemanaSelecionado = null;
        }
        etapaDadosPessoais.classList.add('hidden');
        btnAgendar.classList.add('hidden');
        horarioSelecionado = null;
    }
    
    motivoTextarea.addEventListener('input', function() {
        const caracteresRestantes = 40 - this.value.length;
        contadorCaracteres.textContent = `${caracteresRestantes} caracteres restantes`;
    });

    btnAgendar.addEventListener('click', async function() {
        const data = seletorDataEspecifica.value;
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const motivo = motivoTextarea.value;
        
        const dominioPermitido = "@facmais.edu.br";
        if (!email.toLowerCase().endsWith(dominioPermitido)) {
            alert(`Por favor, use um e-mail institucional.\nO e-mail deve terminar com "${dominioPermitido}".`);
            return;
        }

        if (!coordenadorSelecionado || !data || !horarioSelecionado || !nome || !telefone || !motivo) {
            alert('Por favor, preencha todos os campos e selecione um horário.');
            return;
        }
        
        btnAgendar.disabled = true;
        btnAgendar.textContent = "Verificando...";

        const dadosParaAgendar = {
            dataAgendamento: data,
            horario: horarioSelecionado,
            nomeAluno: nome,
            emailAluno: email,
            telefoneAluno: telefone,
            motivo: motivo,
            coordenadorEmail: coordenadorSelecionado.email,
            cursoNome: coordenadorSelecionado.curso
        };

        try {
            const response = await fetch('/api/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaAgendar)
            });

            if (response.status === 409) {
                alert("Desculpe, este horário acabou de ser agendado por outra pessoa. Por favor, recarregue a página e escolha um novo horário.");
                window.location.reload();
                return;
            }

            if (!response.ok) {
                throw new Error('Houve uma falha na comunicação com o servidor.');
            }

            const result = await response.json();
            alert("Agendamento realizado com sucesso! Um convite foi enviado para o seu e-mail.");
            window.location.reload();

        } catch (error) {
            console.error('Erro no agendamento:', error);
            alert('Não foi possível realizar o agendamento. Por favor, tente novamente mais tarde.');
        } finally {
            btnAgendar.disabled = false;
            btnAgendar.textContent = "Confirmar Agendamento";
        }
    });
});
