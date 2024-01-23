// acrescentar aqui tudo o que precisar ser feito no carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    autocomplete();
    dataListLoad();
    // Obtém a referência para os campos e o botão
    var mainForms = document.querySelector('.main-forms');
    var btnSalvar = document.getElementById('btnSalvar');
    var inputDate = document.getElementById('inputDataEmissao');
    // readOnly?
    document.getElementById("inputDataAbertura").readOnly = true;
    
    var todayDate = (new Date()).toISOString().split('T')[0];
    inputDate.setAttribute('max', todayDate);
    inputDate.classList.add('custom-date-field');
    
    // Adiciona um ouvinte de eventos de mudança para o grupo de campos
    mainForms.addEventListener('change', function() {
        if (!btnEditar.hasAttribute('disabled')) {
          btnSalvar.removeAttribute('disabled');
        }
    });

});

// JQUERY inputs maiúsculos
$('.main-forms input, .main-forms select, .main-forms textarea').on('input', function() {
  // Verifica se é um campo de texto ou um campo de seleção
  if ($(this).is('input, textarea')) {
    // Para campos de input e textarea, converte para maiúsculas
    $(this).val($(this).val().toUpperCase());
  } else if ($(this).is('select')) {
    // Para campos de seleção, converte para maiúsculas
    var selectedOption = $(this).find('option:selected').text();
    $(this).find('option:selected').text(selectedOption.toUpperCase());
  }
});

function verificarValorCampo(campo) {
  if (campo == null) {
    console.log('O valor do campo ' + campo.id + ' é null ou undefined.');
    return false;
  } else if (typeof campo === 'number' && isNaN(campo)) {
    console.log('O valor do campo ' + campo.id + ' é NaN.');
    return false;
  } else if (typeof campo === 'number' && !isFinite(campo)) {
    console.log('O valor do campo ' + campo.id + ' é um número infinito.');
    return false;
  } else if (typeof campo === 'object' && campo.constructor === Error) {
    console.log('O valor do campo ' + campo.id + ' é um objeto de erro.');
    return false;
  } else {
    return true;
  }
}


function autocomplete() {
    // Seleciona todos os formulários no documento
    var forms = document.querySelectorAll('form');

    // Itera sobre os formulários e define o atributo autocomplete como "off"
    forms.forEach(function(form) {
        form.setAttribute('autocomplete', 'off');
    });
}
 
function dataListLoad() {
      // Referência ao datalist
      var datalist = document.getElementById('datalistOptions');
  
      // Adicionando opções dinamicamente
      bairrosBelem.forEach(function(option) {
        var optionElement = document.createElement('option');
        optionElement.value = option;
        datalist.appendChild(optionElement);
      });
}

// reset form
function resetForm(frm) {
    //passe o parâmetro 1 se quiser limpar todos os campos
    //passe o id do form se quiser limpar somente ele 
    if (frm !== 1) {
      const form = document.getElementById(frm)
      const inputs = form.querySelectorAll('input.is-invalid');
      for (let i = 0; i < inputs.length; i++) {
          inputs[i].classList.remove('is-invalid','text-danger');
      }
      return form.reset();
    } else {      
      $('#btnSalvar').prop('disabled', true);
      $('#btnCNP').prop('disabled', true);

      const forms = document.querySelectorAll('form');

      for (let i = 0; i < forms.length; i++) {
        // Seleciona todos os inputs com a classe 'is-invalid' dentro do formulário
        const inputs = forms[i].querySelectorAll('input.is-invalid');
        for (let j = 0; j < inputs.length; j++) {
            // Remove as classes 'is-invalid' e 'text-danger' de cada input
            inputs[j].classList.remove('is-invalid', 'text-danger');
        }
        // Reseta o formulário
        forms[i].reset();
      }
    }

    let buttons = ['btnLink', 'btnPDF']
    buttons.forEach(element => {
      let btn = document.getElementById(element);
      btn.disabled = true;
    });

    urlDoLinkPdf = '';

    window.scrollTo(0, 0);
}

// inputs
function inputProcesso(input) {
    // Remove caracteres não numéricos usando uma expressão regular
    input.value = input.value.replace(/[^0-9]/g, '');
  
     // Converte para número e verifica se está no intervalo
    var valor = parseInt(input.value, 10);
    if (isNaN(valor) || valor < 1) {
        input.value = '';
    } else if (valor > 999999) {
        // Trunca para 5 dígitos se houver mais
        input.value = valor.toString().substring(0, 6);
    } else {

    }
}

function inputCod(input) {
 input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
 input.value = input.value.toString().substring(0, 8);
}

function inputCNPJ(input) {
  let valor = input.value;
  let x;

  if (valor.length >= 15) {
      x = valor.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
      input.value = !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '/' : x[4]) + x[4] + (x[5] ? '-' + x[5] : '');
      switchCNP(input);
    } else {
      x = valor.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
      input.value = !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '-' + x[4] : '');
      switchCNP(input);
  }
}

function inputPesquisa(input) {
  const eCriterio = document.getElementById('floatingSelectSearch');
  
  if (isNaN(parseInt(eCriterio.value))) {
    input.value = '';
  } else {
    switch (parseInt(eCriterio.value)) {
      case 1: // código 
        inputCod(input);
        break;
      case 2: // CPF / CNPJ
        inputCNPJ(input);
        break;
      default: // Licença e código (3 e 4)
        inputProcesso(input);
    }
  }
}

function inputCnae(input) {
    // Remove caracteres não numéricos
    let numero = input.value.replace(/\D/g, '');

    // Garante que o número tenha no máximo 7 dígitos
    numero = numero.substring(0, 7);

    // Adiciona o caractere "-" quando o quinto número é fornecido
    if (numero.length >= 5) {
      numero = numero.substring(0, 4) + '-' + numero.substring(4);
    }

    // Adiciona o caractere "/" quando o sexto número é fornecido
    if (numero.length >= 7) {
      numero = numero.substring(0, 6) + '/' + numero.substring(6);
    }

    // Formatação específica: 0000-0/00
    const formato = /^(\d{4})(\d)(\d{2})$/;
    if (formato.test(numero)) {
      numero = numero.replace(formato, '$1-$2/$3');
    }

    // Atualiza o valor do input
    input.value = numero;
}

function inputViaz(input) {
    // Obtém o valor atual do input
    let valorInput = input.value;
    // Remove caracteres não numéricos
    valorInput = valorInput.replace(/\D/g, '');
    // Garante que o valor está entre 1 e 9
    valorInput <= 9 && valorInput >= 1
    ? input.value = valorInput + 'ª via'
    : valorInput > 9 && valorInput != 0 && valorInput[valorInput.length -1] != 0
    ? input.value = valorInput[valorInput.length -1] + 'ª via'
    : input.value = '';

}

function findCnae() {
    // Obtemos o elemento input pelo ID
    const inputElement = document.getElementById('inputstaticBackdropCnaeBuscar');
    
  // Se o elemento existir, pegamos o valor do input
  if (inputElement) {
    var str = inputElement.value.trim();

    // Formato específico: 0000-0/00
    var formato = /^\d{4}-\d{1}\/\d{2}$/;

    // Testa se a string atende ao formato
    if (formato.test(str)) {
      // Filtra os valores associados ao CNAE na lista cnaeData
      var cnaeEncontrado = cnaeData.find(function(cnae) {
        return cnae.code === str;
      });

      // Se CNAE for encontrado, atualiza os elementos
      if (cnaeEncontrado) {
        // Obtém os elementos pelos IDs
        const codigoElement = document.getElementById('inputstaticBackdropCnaeCodigo');
        const descricaoElement = document.getElementById('inputstaticBackdropCnaeDescricao');
        const stick = codigoElement.value.split('/').length;

        if (codigoElement.value.trim() === '') {
          
          codigoElement.value = `${cnaeEncontrado.code}`;
          
        } else if (!codigoElement.value.includes(cnaeEncontrado.code)) {  
                if (stick === 2) {
                    codigoElement.value = `1. ${codigoElement.value}; 2. ${cnaeEncontrado.code}`
                } else {
                    codigoElement.value = `${codigoElement.value}; ${stick}. ${cnaeEncontrado.code}`
                }  
            } else {
                // Se o campo de código já contiver cnaeEncontrado.code, encerra a função
                alertFailSearch(inputElement);
                return classBtnExportCnae;
            }

            classBtnExportCnae();

        // Se o campo de descrição estiver vazio, insere 'value' nele
        if (descricaoElement.value.trim() === '') {
          descricaoElement.value = `${cnaeEncontrado.value}`;
        } else if (stick === 2) {
          descricaoElement.value = `1. ${descricaoElement.value}; 2. ${cnaeEncontrado.value}`
        } else {
            descricaoElement.value = `${descricaoElement.value}; ${stick}. ${cnaeEncontrado.value}`
        }
        inputElement.value = '';
      } else {
        alertFailSearch(inputElement);
        return classBtnExportCnae;
      }
    }
  }
}

function exportCnae() {
  const codigoCnae = document.getElementById('inputstaticBackdropCnaeCodigo');
  const descricaoCnae = document.getElementById('inputstaticBackdropCnaeDescricao');
  const codigoForm = document.getElementById('inputCnaeLiberado');
  const descricaoForm = document.getElementById('inputDespacho');

  if (codigoCnae.value.length >= 7 && descricaoCnae.value.length >= 5) {
    codigoForm.value += codigoCnae.value;
    descricaoForm.value += descricaoCnae.value.toUpperCase();
    resetForm('formCnae');
    autoExpand(descricaoForm);
  } else {
    alertFailSearch(codigoCnae);
    alertFailSearch(descricaoCnae);
  }
  classBtnExportCnae();
}

function classBtnExportCnae() {
  //habilita e desabilita o botão de exportar baseado nos campos de pesquisa
  const btnExportar = document.getElementById('btnExportarCnae');
  const codigoElement = document.getElementById('inputstaticBackdropCnaeCodigo');
  if (codigoElement.value.trim() === '') {
      if (!btnExportar.hasAttribute("disabled")) {
        btnExportar.setAttribute("disabled", "disabled");
      }
  } else {
    btnExportar.removeAttribute('disabled');
  }
}

function hideIconSearch() {
    // Obtém o elemento
    var iconBtnBuscar = document.getElementById("iconBtnBuscar");

    // Substitui a classe d-none pela classe d-block
    iconBtnBuscar.classList.replace("d-none", "d-block");

    // Aguarde 5 segundos
    setTimeout(function() {
        // Substitui a classe d-block pela classe d-none
        iconBtnBuscar.classList.replace("d-block", "d-none");
    }, 1500);
}

function alertFailSearch(e) {
  function changeColor() {
    e.classList.add("bg-danger", "bg-opacity-50");

    setTimeout(() => {
      e.classList.remove("bg-danger", "bg-opacity-50");
    }, 90);
  }

  // Piscar 3 vezes
  for (let i = 0; i < 2; i++) {
    setTimeout(changeColor, i * 150);
  }
}

function autoExpand(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight+5) + 'px';
}

function clearSearch() {
  document.getElementById('floatingInputChave').value = '';
  document.getElementById('floatingSelectAno').value = '';
}

function isElement(e) {
  return e instanceof HTMLElement;
}

function alertFailSearchDB(e) {
  if (isElement(e)) {
    alertFailSearch(e);
  } 
}

function switchCNP(input) {
  var btn = document.getElementById('btnCNP');
  if (input.value.length == 14) {
    isValidCPF(input) == false ? input.classList.add("is-invalid", "text-danger") : input.classList.remove("is-invalid", "text-danger");
  } else if (input.value.length == 18) {   
    if (!isValidCNPJ(input)) {
      input.classList.add("is-invalid", "text-danger");
      input.classList.remove("is-valid");
      btn.setAttribute("disabled", "");
    } else {
      input.classList.remove("is-invalid", "text-danger");
      btn.removeAttribute("disabled");
    }
  } else {
    input.value.length > 0 ? input.classList.add("is-invalid", "text-danger") : input.classList.remove("is-invalid", "text-danger");
    btn.setAttribute("disabled", "");
  }
}

function isValidCNPJ(input){
  const cnpj = input.value
  var b = [ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ]
  var c = String(cnpj).replace(/[^\d]/g, '')
  
  if(c.length !== 14)
      return false
  
  if (/^(\d)\1*$/.test(c))
      return false

  if(/0{14}/.test(c))
      return false

  for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
  if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
      return false

  for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
  if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
      return false

  return true
}

function isValidCPF(input){
  const cpf = input.value;
  var b = [ 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];
  var c = String(cpf).replace(/[^\d]/g, '');

  if (c.length !== 11)
      return false;

  if (/^(\d)\1*$/.test(c))
      return false;

  if (/0{11}/.test(c))
      return false;

  for (var i = 0, n = 0; i < 9; n += c[i] * b[++i]);

  if (c[9] != (((n %= 11) < 2) ? 0 : 11 - n))
      return false;

  for (var i = 0, n = 0; i <= 9; n += c[i] * b[i++]);

  if (c[10] != (((n %= 11) < 2) ? 0 : 11 - n))
      return false;

  return true;
}

function clearInvalidClass(input) {
  input.classList.remove("is-invalid", "text-danger")
}

async function btnAlertWarning(btn, msg, res){
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-diamond-fill" viewBox="0 0 16 16"><path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>'
  const bu = document.getElementById(btn);

  res == 'Success'
  ?  bu.classList.add('btn-success', 'border-success', 'alert-success', 'text-success')
  :  bu.classList.add('btn-warning', 'border-warning', 'alert-warning', 'text-warning');

  bu.innerHTML = icon + '&nbsp' + msg
  bu.classList.remove("d-none")

  await getTimeOut(2000);

  bu.classList.add("d-none");
  bu.classList.remove('btn-success', 'border-success', 'alert-success', 
  'btn-warning', 'border-warning', 'alert-warning','text-success', 'text-warning');
}

function getTimeOut(tempo) {
  return new Promise(function (resolve) {
    setTimeout(resolve, tempo);
  });
}

function setReadOnly() {
  let mainFormInputs = document.querySelectorAll('group.main-forms input, group.main-forms select, group.main-forms textarea');
  mainFormInputs.forEach(function(element) {
    if (element.tagName.toLowerCase() === 'select') {
      var options = element.querySelectorAll('option');
      options.forEach(function(option) {
        option.setAttribute('disabled', true);
      });
    } else {
      element.setAttribute('readonly', true);
    }
  });
}

function removeReadOnly() {
  let data1, data2, el = ''
  let cod = document.getElementById('inputCodigo');
  let mainFormInputs = document.querySelectorAll('group.main-forms input, group.main-forms select, group.main-forms textarea');
  
  mainFormInputs.forEach(function(element) {
    if (element.tagName.toLowerCase() === 'select') {
      var options = element.querySelectorAll('option:not([value=""])');
      options.forEach(function(option) {
        option.removeAttribute('disabled');
      });
    } else {

      element.id != 'inputStatus' &&  element.id != 'inputRequisito' &&
      element.id != 'inputCodigo' &&  element.id != 'inputCnaeDecladado' &&
      element.id !=  'inputDataAbertura' && element.id !=  'inputLF' // aqui ficam as exceções.
      ? element.removeAttribute('readonly')
      : '';

      element.id == 'inputCodigo'
      ? (el = element, (cod.value != '' ? el.setAttribute('readonly', true) : ''))
      : '';

      element.id == 'inputGDOC'
      ? (cod.value != '' ? element.setAttribute('readonly', true) : '')
      : '';

      if (element.id == 'inputDataAbertura') {
        data1 = new Date(element.value)
        data2 = new Date('2024-01-01')
      }       
    }
  });
  //console.log(data1.getTime(), data2.getTime(), typeof(data1.getTime()), typeof(data2.getTime()))
  data1.getTime() < data2.getTime()
  ? el.setAttribute('readonly', true)
  : el.removeAttribute('readonly');

  $("#btnCnae").removeAttr("disabled");

}

function getYear() {
    var inputData = document.getElementById('inputDataEmissao');
    //console.log('getYear(): ' + inputData)
    var data = new Date(inputData.value);
    var ano = data.getFullYear();
    return ano;
}

function isMainFomsValid() {
  var formGroup = document.querySelector('.main-forms');
  var forms = formGroup.querySelectorAll('form');
  var checkVal = true; // Inicializa como true para que o valor correto seja mantido

  if (getYear()>=2024) {
      $("#inputCodigo, #inputRequisito").prop("required", true);
  } else if (getYear()<2024) {
      $("#inputCodigo, #inputRequisito").removeAttr("required");
  } else {
      console.error("Erro no getYear(), saindo...")
      return;
  }

  forms.forEach(function (form) {
      if (!form.checkValidity()) {
          checkVal = false;
      }
  });

  if (checkVal) {
    return true;
  } else {
      return false;
  }
}

function disableBtnTrio() {
  $("#btnSalvar").prop("disabled", true);
  $("#btnPDF").prop("disabled", true);
  $("#btnExplorer").prop("disabled", true);
}

function convertDate(date) {
  const [ano, mes, dia] = date.split('-').map(Number);
  const dataFormatada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
  return dataFormatada;
}

function format0000(numero, comprimento) {
  return numero.toString().padStart(comprimento, '0');
}

// odeio variáveis globais
var urlDoLinkPdf = '';
function hyperlinkOpenPdf() {
  //console.log('hyperlinkOpenPdf: ' + urlDoLinkPdf)
  window.open(urlDoLinkPdf, '_blank');
}

function forcingOnInputEvent(input) {
  var inputElement = document.getElementById(input);
  
  // Criar um evento personalizado 'input' sem alterar o valor
  var eventoInput = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText', // Pode ser 'insertText', 'insertFromPaste', etc.
  });

  // Disparar o evento no elemento de input
  inputElement.dispatchEvent(eventoInput);
}


// Função para verificar a condição
function verificarCondicaoLicenca() {
  var dataZ4 =  $("#inputDataEmissao").val();
  var anoZ4 = new Date(dataZ4).getFullYear();
  var dataLimite = new Date(anoZ4, 2, 31); // Mês é 0-indexed, então 2 representa março

  if (new Date() <= dataLimite) {
    return 'Válida';
  } else {
    return 'Expirada';
  }
}

function openFolder() {
  const driveLf = 'https://drive.google.com/drive/folders/1AQzoGAGYmeVZd5qD-_uYnUXxaKJSP3XP?usp=drive_link'
  window.open(driveLf, '_blank');
}