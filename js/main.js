// Eu odeio constantes e variáveis de escobo global...
var automateValueOfLf = 0;


// JQUERY carregamento do DOM
$(document).ready(function() {
    if ($(window).width() < 768) {
        $(".hstack").removeClass("hstack").addClass("vstack");
    }
    window.scrollTo(0, 0);
    applyRandomClassGoogl(); // mudar cor google
   
});

async function buscarCNPJ() {

    const cnpj = String(document.getElementById('inputCNP').value).replace(/[^\d]/g, '')
    //cnpj = '05054671000159'
    //cnpj = '10525225000115'
    //var proxing = ['https://cors-anywhere.herokuapp.com/', 'https://api.codetabs.com/v1/proxy/?quest=', 'https://corsproxy.io/?'];
    var proxing = ['https://cors-anywhere.herokuapp.com/', 'https://api.codetabs.com/v1/proxy/?quest=', 'https://corsproxy.io/?'];
    
    // remover cors-anywhere por enquanto
    proxing.shift();

    const apiUrl1 = "https://publica.cnpj.ws/cnpj/";
    const apiUrl2 = "https://receitaws.com.br/v1/cnpj/";

    // Escolher aleatoriamente um valor do vetor proxing
    const selectedProxing = proxing[Math.floor(Math.random() * proxing.length)];

    // Construir a URL completa da primeira API
    var urlCompleta = selectedProxing + apiUrl1 + cnpj;

    try {
        // Fazer a solicitação usando o fetch
        const response = await fetch(urlCompleta);

        if (!response.ok) {
            throw new Error(`Erro na solicitação 1: ${response.status}`);
        }

        const data = await response.json();

        // Imprimir o JSON no console
        //console.warn("1ª API:", data);

        loadData1(data);
        
    } catch (error) {
        // Em caso de erro com apiUrl1, tentar apiUrl2
        return console.error('Erro em 1:', error);

        // Construir a URL completa da segunda API
        var urlCompleta2 = selectedProxing + apiUrl2 + cnpj;

        try {
            // Fazer a solicitação usando o fetch para apiUrl2
            const response2 = await fetch(urlCompleta2);

            if (!response2.ok) {
                throw new Error(`Erro na solicitação 2: ${response2.status}`);
            }

            const data2 = await response2.json();
            // Imprimir o JSON no console
            //console.warn("2ª API:", data2);
            
            loadData2(data2);

        } catch (error2) {
            console.error('Erro em 2: ', error2);
        }
    }
}

function loadData1(jsonData) {
// Matriz com os IDs dos inputs e os caminhos das propriedades do JSON
    const inputMapping = [
        ["cnpjAtualizacao", "atualizado_em"],
        ["cnpjSituacao", "estabelecimento.situacao_cadastral"],
        ["cnpjCNPJ", "estabelecimento.cnpj"],
        ["cnpjRazao", "razao_social"],
        ["cnpjEndereco", "estabelecimento.logradouro"],
        ["cnpjNumero", "estabelecimento.numero"],
        ["cnpjComplemento", "estabelecimento.complemento"],
        ["cnpjMunicipio", "estabelecimento.cidade.nome"],
        ["cnpjCEP", "estabelecimento.cep"],
        ["cnpjTipo", "estabelecimento.tipo"],
        ["cnpjPorte", "porte.descricao"],
        ["cnpjMEI", "simples.mei"],
        ["cnpjCapital", "capital_social"],
        ["cnpjQSA", "socios.0.nome"],
        ["tbodyCnaePrincipal", "estabelecimento.atividade_principal"],
        ["tbodyCnaeSecundario", "estabelecimento.atividades_secundarias"]
    ];

    let n = 0;
    // Loop através do inputMapping
    inputMapping.forEach(([inputId, jsonPath]) => {
        // Verifica se há um número no caminho (indicando um loop)
        const match = jsonPath.match(/(\w+)\.(\d+)\.(\w+)/);
            if (match) {
                const [fullPath, arrayName, index, propertyName] = match;
                // Inicializa a propriedade do array se ainda não existir
                if (!jsonData[arrayName]) {
                    jsonData[arrayName] = [];
                }

                if (arrayName == 'socios') {
                const socios =  jsonData.socios.map(item => item.nome).join(', ');
                document.getElementById(inputId).value = socios
                } else {
                // jsonData[arrayName][index] = jsonData[arrayName][index][propertyName];
                    document.getElementById(inputId).value = jsonData[arrayName].join(", ");
                }
            
            } else {

                if (jsonPath === "estabelecimento.atividade_principal") {
                    document.getElementById(inputId).innerHTML = getValueByPath(jsonData, jsonPath, cnaeData);
                    document.getElementById('btnAccordionCnpjCnae1').innerHTML = 'Atividade principal (1)';
                } else if (jsonPath === "estabelecimento.atividades_secundarias") { 
                    document.getElementById(inputId).innerHTML = getValueByPath(jsonData, jsonPath, cnaeData);
                    document.getElementById('btnAccordionCnpjCnae2').innerHTML = 'Atividades secundárias ('+ n +')';
                } else {
                    document.getElementById(inputId).value = getValueByPath(jsonData, jsonPath, '?');
                }

            }
    });


    function getValueByPath(obj, path, cnaeData) {
        const keys = path.split('.');
        const value = keys.reduce((acc, key) => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, obj);

        if (path === "estabelecimento.logradouro") {
            const tipo_log = obj["estabelecimento"]["tipo_logradouro"];
            return `${tipo_log} ${value}`;
        }

        if (path === "capital_social") {
            const capital = obj["capital_social"];
            return parseFloat(capital).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        }

        

        if (path === "simples.mei") {
            if (obj["simples"] == null && obj["simples"] == undefined) {
                return "Não";
            }
        }

        if (path === "estabelecimento.cnpj") {
            var cnpj = obj["estabelecimento"]["cnpj"];
            cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
            return cnpj;
        }

        if (path === "estabelecimento.cep") {
            var cep = obj["estabelecimento"]["cep"];
            cep = cep.replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2-$3");
            return cep;
        }

        if (path === "atualizado_em") {
            const dataString = obj["atualizado_em"];
            const data = new Date(dataString);
            const dia = ("0" + data.getDate()).slice(-2);
            const mes = ("0" + (data.getMonth() + 1)).slice(-2);
            const ano = data.getFullYear();
            const dataFormatada = `${dia}/${mes}/${ano}`;
            return dataFormatada;
        }

        if (path === "estabelecimento.atividade_principal") {
            // Filtra atividade principal com base em cnaeData.code
            const filteredPrincipal = cnaeData.find(item => item.code === obj["estabelecimento"]["atividade_principal"]["subclasse"]);
            if (filteredPrincipal) {
                const cnae_principal = `<tr><td>${filteredPrincipal["code"]}</td><td>${filteredPrincipal["value"]}</td></tr>`;
                return cnae_principal;
            }
        }
    
        if (path === "estabelecimento.atividades_secundarias" && obj["estabelecimento"]["atividades_secundarias"].length > 0) {
            // Filtra atividades secundárias com base em cnaeData.code
            const filteredSecundarias = obj["estabelecimento"]["atividades_secundarias"].filter(secundaria =>
                cnaeData.find(item => item.code === secundaria["subclasse"])
            );
    
            if (filteredSecundarias.length > 0) {
                var subclasse = '';
                for (let i = 0; i < filteredSecundarias.length; i++) {
                    subclasse += `<tr><td>${filteredSecundarias[i]["subclasse"]}</td><td>${filteredSecundarias[i]["descricao"]}</td></tr>`;
                }
                n = filteredSecundarias.length;
                return subclasse;
            }
        }
    
        
        if (path === "estabelecimento.situacao_cadastral" && obj["estabelecimento"]["motivo_situacao_cadastral"]) {
            const motivoValue = obj["estabelecimento"]["motivo_situacao_cadastral"]["descricao"];
            return `${value}, ${motivoValue}`;
        }
        

        return value;
    }

    function validateForms() {
        var e = document.getElementById('cnpjSituacao')
        var f = document.getElementById('cnpjMunicipio')
        var g = document.getElementById('cnpjCEP')
        
        e.value != 'Ativa' ? $(e).addClass('is-invalid') : $(e).removeClass('is-invalid');
        g.value.substring(0, 2) != '66' ? $(f).addClass('is-invalid') : $(f).removeClass('is-invalid'); 
    }

    validateForms();
}

function loadData2(jsonData) {

}

async function loadFormCNPJ() {
    $(".overlayCNPJ").toggleClass("d-none")
    await buscarCNPJ(); // aqui começa
    $(".overlayCNPJ").toggleClass("d-none")
}
        
// JQUERY Lidar com alterações de tamanho de tela
$(window).resize(function() {
if ($(window).width() < 768) {
    $(".hstack").removeClass("hstack").addClass("vstack");
} else {
    $(".vstack").removeClass("vstack").addClass("hstack");
}
});

// Função para gerar uma classe aleatória
function getRandomClassGoogl() {
    var classes = ['btn-primary', 'btn-success', 'btn-danger', 'btn-warning'];
    var randomIndex = Math.floor(Math.random() * classes.length);
    return classes[randomIndex];
}

// Função para aplicar uma classe aleatória ao elemento com o ID btnGoogle
function applyRandomClassGoogl() {
    var randomClass = getRandomClassGoogl();
    $('#btnGoogle').addClass(randomClass);
}
  
/** Buscar processo, salvar, gerar PDF...
 * A partir daqui
*/

async function loadFormBuscar() {
    $(".overlayBuscar").toggleClass("d-none");
    buscarProcesso('load');
    // eita gambiarra! Em toda cadeia de funções eu coloquei $(".overlayBuscar").toggleClass("d-none");
}

function loadFormPdf() {
    if ($('#btnLink').is(':disabled')) {
        const myModal = new bootstrap.Modal(document.getElementById('modalSavePdf'))
        myModal.show();
    } else {
        const myModal = new bootstrap.Modal(document.getElementById('modalErasePdf'))
        myModal.show();
    }
}

// JS buscar processo
async function buscarProcesso(tipoBusca) {
    if (!checkToken()){
        $(".overlayBuscar").toggleClass("d-none"); // gambiarra
        await btnAlertWarning('btnAlertWarningBuscar', 'Sem token', 'Fail');
        resetForm('formSearch');
        $('#dismissEditar').trigger('click'); 
        return;
    } 

    let validity = true;
    var eCriterio, eChave, eAno;

    if (tipoBusca === 'load') {
        eCriterio = document.getElementById('floatingSelectSearch');
        eChave = document.getElementById('floatingInputChave');
        eAno = document.getElementById('floatingSelectAno');

        if (eCriterio.value == "" || eCriterio.value < 1) {
            alertFailSearchDB(eCriterio);
            validity = false;
        }
        if (eChave.value == "" || eChave.value < 1 || eCriterio.value == 2 &&
                (!(eChave.value.length == 18) && !(eChave.value.length == 14)) || eChave.classList.contains('is-invalid') ) {
            alertFailSearchDB(eChave);
            validity = false;
        }
        if (eAno.value == "" || eAno.value < 1) {
            alertFailSearchDB(eAno);
            validity = false;
        }

        if (eAno.value < 3 && eCriterio.value == 1) {
            alertFailSearchDB(eCriterio);
            alertFailSearchDB(eAno);
            validity = false;
        }

    } else if (tipoBusca === 'save') {
        eAno = document.getElementById('inputDataAbertura');
        eCriterio = '';
        eChave = '';

        if (parseInt(eAno.value.substring(0, 4)) >= 2024) {
            eChave = document.getElementById('inputCodigo');
            eCriterio = 1; // busca pelo código;
        } else {
            eChave = document.getElementById('inputLF');
            eCriterio = 4; // busca pela licença;
        }
    } else {
        console.log("Erro em 'tipoBusca'. Saindo...");
        return;
    }

    if (validity) {    
        //console.log("Não tem nem um mês válido")
        
        await carregarProcesso(tipoBusca, eCriterio, eChave, eAno);
       } else {
        console.log("Form inválido");
        $(".overlayBuscar").toggleClass("d-none"); // gambiarra
        return;
    }
}

// JS Carregar processo
async function carregarProcesso(tipoBusca, eCriterio, eChave, eAno) {

    var eCr, eCh = eChave.value, eAn;
    
    if (tipoBusca === 'load') {
        eCr = eCriterio.value;
    } else if (tipoBusca === 'save') {
        eCr = eCriterio;
    } else {
        console.error('Erro no tipoBusca, em carregarProcesso(). Saindo...');
        return;
    }

    if (eAno.tagName.toLowerCase() === 'select') {
        eAn = eAno.options[eAno.selectedIndex].text
    } else {
        eAn = eAno.value.substring(0, 4);
    }

    // escolher os intervalos da planilha
    if (eCr == 1) { //Código
        eAn >= 2024 ? range = `Raw LF!T2:U` : '';
    } else if (eCr == 2) { //CPF, CNPJ
        eAn >= 2024 ? range = 'Raw LF!T2:V' : range = 'Raw LF Old!B2:D';
    } else if (eCr == 3) { //processo
        eAn >= 2024 ? range = 'Raw LF!S2:T' : range = 'Raw LF Old!A2:B';
    } else if (eCr == 4) { //Licença
        eAn >= 2024 ? range = 'Raw LF!T2:W' : range = 'Raw LF Old!B2:C'; 
    } else {  
        return console.log('Erro em carregarProcesso().');;
    }

    if (range === '') {
        console.error('Código não existia antes de 2024...')
        await btnAlertWarning('btnAlertWarningBuscar', 'Código inválido', 'Fail');
        $(".overlayBuscar").toggleClass("d-none"); // gambiarra
        return;
    }    
   
    await gapiGetProcess(tipoBusca, eCr, eCh, eAn, range);
}

async function salvarProcesso(rng) {
    var formGroup = document.querySelector('.main-forms');
    var forms = formGroup.querySelectorAll('form');
    var checkVal = true; // Inicializa como true para que o valor correto seja mantido

    if ($(".inputDataEmissao").val() === '' || $(".inputDataEmissao").val()) {
    }

    var inputDataEmissaoVal = $("#inputDataEmissao").val();

    switch (inputDataEmissaoVal) {
        case undefined:
        case null:
        case NaN:
        case '':
            var myModal = new bootstrap.Modal(document.getElementById('modalSaveFail'));
            return myModal.show();
    }

    if (getYear()>=2024) {
        $("#inputCodigo, #inputRequisito").prop("required", true);
        // preencher o input LF

    } else if (getYear()<2024) {
        $("#inputCodigo, #inputRequisito").removeAttr("required");
    } else {
        console.error("Erro no getYear(), saindo...")
        var myModal = new bootstrap.Modal(document.getElementById('modalSaveFail'));
        return myModal.show();
    }

    // geração de número incremental
    await maxNumberOfNumLf();

    forms.forEach(function (form) {
        // Verifica a validade dos campos antes de prosseguir com a submissão
        if (!form.checkValidity()) {
            $(form).addClass("was-validated");
            checkVal = false;
        }
    });

    if (checkVal) {

        var formDataObject = {};
        forms.forEach(function (form) {
            var formData = new FormData(form);
            formData.forEach(function (value, key) {
                formDataObject[key] = value;
            });
        });
        
        await gapiSaveProc(formDataObject, rng);

        // rotinas do pós submissão
        $("#btnSalvar").prop("disabled", true); // desabilitar botão salvar
        setReadOnly(); // bloquear o form pra edição
        // ###### habilitar a geração do PDF.
    } else {
        const myModal = new bootstrap.Modal(document.getElementById('modalSaveFail'))
        myModal.show();
        //console.warn('Dados inválidos no formulário');
    }
}

/** 
 * Anexar o link do PDF ao botão na pesquisa
 * 
 * libera PDF depois da pesquisa bem-sucedida em 2024
 * Se clicar no botão de editar, bloqueia PDF
 * Se salvar em 2024 for bem-sucedido, libera PDF
 * Se limpar o formulário, bloqueia PDF
*/


