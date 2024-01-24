var tokenClient, access_token;

function gapiStart() {
    gapi.client.init({
  }).then(function() {
    gapi.client.load('sheets', 'v4');
    gapi.client.load('drive', 'v3');
    gapi.client.load('docs', 'v1');
  }).then(function(response) {
    //console.log('discovery document loaded');
  }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
  });
}

function gapiLoad() {
  gapi.load('client', gapiStart)
}

function gisInit() {
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents';
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: '967292891718-6dlp5pmns8honktha6gvbh2irnu1hpv1.apps.googleusercontent.com',
    scope: SCOPES,
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token;
      enableButton();
    },
  });
}

async function getToken() {
  await tokenClient.requestAccessToken();
  //$("#btnRevokeToken").removeAttr("disabled");
  return access_token
}

function enableButton(){
  if (access_token) {
    document.getElementById('btnBuscar').removeAttribute('disabled');
  } else {
    console.log('Sem token de acesso. O botão continuará desabilitado')
  }
}

function checkToken() {
  // verifica se o usuário possui token de acesso
  if (access_token) {
    return true;
    //console.log(access_token)
  } else {
    //console.log("No token is found")
    return false;
  }
  //console.log(access_token)
  //console.log(tokenClient)
}

function revokeToken() {
  google.accounts.oauth2.revoke(access_token, () => {
    //console.log('Token de acesso Revogado')
    console.alert('Fret not father, we have no need of thy flail. Tis only the flame, quivering at misguided Token. Please, avert thine eyes. I will snuff out this Token for good.')
    $("#btnRevokeToken").prop("disabled", true);
  });
}

/** */
function listMajors() {
// Obtém os valores atuais
gapi.client.sheets.spreadsheets.values.get({
  spreadsheetId: '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM',
  range: 'Raw LF Old!A2:A',
}).then(function(response) {
  var range = response.result;
  var values = range.values;

  if (values) {
    // Itera sobre os valores
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      for (var j = 0; j < row.length; j++) {
        // Verifica se o valor contém "666a" e substitui por "666b"
        if (row[j] === "666a") {
          row[j] = "666b";
        }
      }
    }

    // Atualiza os valores na planilha
    gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM',
      range: 'Raw LF Old!A2:A',
      valueInputOption: 'RAW',
      resource: { values: values }
    }).then(function(response) {
      console.log('Valores atualizados com sucesso:', response.result);
    }, function(reason) {
      console.error('Erro ao atualizar valores:', reason.result.error.message);
    });
  } else {
    console.log('Nenhum valor encontrado.');
  }
});
}

async function gapiGetProcess(tipoBusca, eCr, eCh, eAn, range){
  $(".overlay-container").toggleClass("d-none");
  const spreadsheetId = '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM';
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  }).then(async response => {
    const values = response.result.values;
    for (let i = 0; i < values.length; i++) {
      if(values[i].includes(eCh) && values[i].includes(eAn)) {
        //return console.log(`Encontrado: ${values[i]}, linha ${i+2}`);
        if (range.includes('Old')) {
          rng = `Raw LF Old!A${i+2}:AJ${i+2}`
        } else {
          rng = `Raw LF!A${i+2}:AJ${i+2}`
        }

        return await gapiLoadForm(tipoBusca, rng);
        
      } else {
        if (i === values.length - 1) {
          $(".overlayBuscar").toggleClass("d-none"); // gambiarra
          btnAlertWarning('btnAlertWarningBuscar', 'Nenhum resultado', 'Fail');
          return;
        }
      }
    } 
  }).catch(error => {
    console.error('Erro ao buscar linha:', error);
    $(".overlayBuscar").toggleClass("d-none"); // gambiarra
    return;
  });
  $(".overlay-container").toggleClass("d-none");
}

async function gapiLoadForm(tipoBusca, rng) {
  $(".overlay-container").toggleClass("d-none");
  try {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM',
      range: rng,
    }).then(async function(response) {
      const range = response.result;
      const values = range.values;

      if (tipoBusca === 'load') {

        if (values && values.length > 0) {
          let rowData = values[0];
          // Preenche os valores no formulário com base na matriz
          inputMatrix = [];
          if (rng.includes('Old')) {
            inputMatrix = [...inputIdsOld]
          } else {
            inputMatrix = [...inputIdsNew];
            let btnURL = document.getElementById('btnLink');
            if (rowData[32].includes('https://')) {
              urlDoLinkPdf = rowData[32]
              btnURL.disabled = false;
            } else {
              urlDoLinkPdf = '';
              btnURL.disabled = true;
            }
          }

          for (let i = 0; i < inputMatrix.length; i++) {
            let inputId = inputMatrix[i][0];
            let searchColumnIndex = inputMatrix[i][1]; // Coluna de busca
            let inputElement = document.getElementById(inputId);
    
            // Ignora os valores com ''
            if (inputElement && searchColumnIndex !== '' && rowData[searchColumnIndex]) {
              // Verifica se o input é do tipo select
              if (inputElement.tagName.toLowerCase() === 'select') {
                // Seleciona a opção que corresponde ao texto retornado na consulta
                for (let j = 0; j < inputElement.options.length; j++) {
                  if (inputElement.options[j].text === rowData[searchColumnIndex]) {
                    inputElement.selectedIndex = j;
                    break;
                  }
                }
              } else if (inputElement.type === 'date') {
                // Formata o valor para yyyy-MM-dd
                let dateParts = rowData[searchColumnIndex].split('/');
                let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                inputElement.value = formattedDate;
              } else {
                inputElement.value = rowData[searchColumnIndex];
              }
            }
          }
             
          //console.log('gapiGetProcess: ', rowData);
          $(".overlayBuscar").toggleClass("d-none"); // gambiarra
          await btnAlertWarning('btnAlertWarningBuscar', 'Encontrado', 'Success');
          eventoBuscar(); 
        } else {
          console.log('Nenhum valor encontrado.');
          $(".overlayBuscar").toggleClass("d-none"); // gambiarra
        }

      } else if (tipoBusca === 'save') {
        salvarProcesso(rng);
      } else {
        console.error('Erro em gapiLoadForm().')
      }

    });
    } catch(err) {
      console.error(err.message); 
      } 
      $(".overlay-container").toggleClass("d-none");
}

async function gapiSaveProc(formDataObject, rng) {
  $(".overlay-container").toggleClass("d-none");
  try {
    const values = [], spreadsheetId = '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM';
    inputMatrix = [];
    
    if (rng.includes('Old')) {
      inputMatrix = [...inputIdsOld];
    } else {
      inputMatrix = [...inputIdsNew];
      //$("#btnPDF").prop("disabled", false);
    }

    $("#btnPDF").prop("disabled", false);

    inputMatrix.forEach(([inputId, colIndex, colLast]) => {
      const value = formDataObject[inputId];
      if (value !== undefined && value.trim() !== '') {
          const e = document.getElementById(inputId);
          if (e && e.type === 'date') {
              // Se o input for do tipo date, formata a data para "dd/mm/yyyy"
              values[colLast] = value.split('-').reverse().join('/');
          } else if (e && e.tagName === 'SELECT') {
              // Se o input for do tipo select, pega o texto da opção selecionada
              const selectedIndex = e.selectedIndex;
              values[colLast] = selectedIndex !== -1 ? e.options[selectedIndex].text : '';
          } else {
              // Caso geral, apenas atribui o valor diretamente
              values[colLast] = value;
          }
          //console.log(`ID: ${inputId}, value: ${value}, colIndex: '${colIndex}', colLast: '${colLast}'`);
      }
    });

    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: rng,
        valueInputOption: 'RAW',
        //insertDataOption: 'INSERT_ROWS',
        //insertDataOption: 'OVERWRITE',
        resource: {
            values: [values],
        },
    });

    const myModal = new bootstrap.Modal(document.getElementById('modalSaveSuccess'))
    myModal.show();

  } catch (error) {
    disableBtnTrio();
    const myModal = new bootstrap.Modal(document.getElementById('modalSaveFail'))
    myModal.show();
    console.error(error.message);
  }
  $(".overlay-container").toggleClass("d-none");
}

/** GAPI Docs e Drive */
async function createFolder() {
  $(".overlay-container").toggleClass("d-none");
  // Exemplo de uso
  if (!gapi.client.drive) {
    console.error('Cliente do Drive não inicializado em gapiStart().');
  } else {

    var parentFolderId = '1AQzoGAGYmeVZd5qD-_uYnUXxaKJSP3XP'; // ID da pasta pai
    var folderName = '';
    var documentId = '1pAdilPZk3c5bR8qRL5BRgRD7n8rAb-eSn2NfYJWPlQA'; // Modelo de LF
    var valorData = $("#inputDataAbertura").val();

      if (parseInt(valorData.split("-")[0]) < 2024) {
        var anoMes = valorData.split("-").slice(0, 2).join("-");
        folderName = anoMes;  // Nome da nova pasta, XXXX-XX
      } else {
        const criarStringMesAno = () => new Date().toISOString().slice(0, 7);
        folderName = criarStringMesAno();  // Nome da nova pasta, XXXX-XX
      }
      
    // Verifica se a pasta já existe
    gapi.client.drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id, name)'
    }).then(function (response) {
      // Se a pasta não existe, cria uma nova
      if (response.result.files.length === 0) {
        gapi.client.drive.files.create({
          resource: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
          }
        }).then(function (createResponse) {
          //console.log('Pasta criada com sucesso:', createResponse);
          //createDocument(createResponse.result.id);
          saveCopyWithReplacement(parentFolderId, folderName, documentId, modeloLicenca);
        }, async function (createError) {
          console.error('Erro ao criar pasta:', createError);
        });
      } else {
        //console.log('A pasta já existe:', response.result.files[0]);
        //console.log(response.result.files[0].name);
        //createDocument(response.result.files[0].id);
        saveCopyWithReplacement(parentFolderId, response.result.files[0].name, documentId, modeloLicenca);
      }
    }, function (error) {
      console.error('Erro ao verificar a existência da pasta:', error);
    });
  }
  $(".overlay-container").toggleClass("d-none");
}

// Função para criar um documento Google em branco dentro da pasta especificada
// Pode ser chamada diretamente por qualquer função, bastando que passe o ID e o nome do arquivo
async function createDocument(parentFolderId) {
  $(".overlay-container").toggleClass("d-none");
  gapi.client.drive.files.create({
    resource: {
      name: 'Novo Documento',
      mimeType: 'application/vnd.google-apps.document',
      parents: [parentFolderId]
    }
  }).then(function (response) {
    //console.log('Documento criado com sucesso:', response);
  }, function (error) {
    console.error('Erro ao criar documento:', error);
  });
  $(".overlay-container").toggleClass("d-none");
}

// Função para salvar uma cópia do documento Google com substituição de texto
function saveCopyWithReplacement(parentFolderId, folderName, documentId, arrayReplacement) {
  $(".overlay-container").toggleClass("d-none");
  // Busca a pasta filho pelo nome
  gapi.client.drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id)',
    spaces: 'drive'
  }).then(function (folderResponse) {
    if (folderResponse.result.files.length > 0) {
      var childFolderId = folderResponse.result.files[0].id;
      
      var inputs = ['inputLF','inputGDOC','inputDataAbertura','inputDivisao','inputCNP','inputEstabelecimento'];

      inputs.forEach(function (input, index, inputs) {
        let e = document.getElementById(input);
        input === 'inputDataAbertura' ?
        inputs[index] = e.value.slice(0,4) :
        input === 'inputDivisao' ?
        inputs[index] = e.options[e.selectedIndex].text :
        input === 'inputCNP' ?
        inputs[index] = e.value.replace(/[^0-9]/g, '') : 
        inputs[index] = e.value;
      });


      let nomeDoc = `LF-${inputs[0]}_PROC-${inputs[1]}-${inputs[2]}_${inputs[3]}_CNP-${inputs[4]}_EST-${inputs[5].replace(/ /g, '_')}`

      // Copia o documento para a pasta filho
      gapi.client.drive.files.copy({
        fileId: documentId,
        resource: {
          parents: [childFolderId],
          name: nomeDoc
        }
      }).then(function (copyResponse) {
        //console.log('Cópia do documento criada com sucesso:', copyResponse);

        // Realiza as substituições no conteúdo da cópia
        //replacements = [...arrayReplacement];
        //console.log(replacements)
        let replacements = arrayReplacement.map(obj => ({ ...obj }));
        let input;
        
        replacements.forEach(function (item) {
            //console.log(item.newText, item.oldText)
            input = document.getElementById(item.newText);
            if (input === null) {
              console.warn("O elemento " + input.id + " é nulo, é melhor encerrar por aqui")
              return;
            }
            
            if (item.oldText == '{n-via}') {
              item.newText = `${input.value.slice(0, 4)}ia`;
              //console.log(item.oldText, item.newText)
            } else if (item.oldText == '{YYYY}') {
              item.newText = input.value.slice(0, 4);
              //console.log(item.oldText, item.newText)
            } else if (item.oldText == '{YY}') {
              item.newText = input.value.slice(2, 4);
              //console.log(item.oldText, item.newText)
            } else if (item.oldText == '{validade}') {
              item.newText = `31/03/${parseInt(input.value.slice(0, 4))+1}`;
              //console.log(item.oldText, item.newText)
            } else if (item.oldText == '{divisao}') {
              item.newText = input.options[input.selectedIndex].text;
            } else if (item.oldText == '{emissao}') {
              //console.log(input.value)
              item.newText = convertDate(input.value);
            } else if (item.oldText == '{proc}' || item.oldText == '{LF}') {
              item.newText = format0000(input.value, 4);
            } else {              
              if (verificarValorCampo(input.value)) {
                item.newText = input.value;
              } else {
                item.newText = '?';
              }
            }
        });

        // Obtém o corpo do documento copiado
        gapi.client.docs.documents.get({
          documentId: copyResponse.result.id
        }).then(function (getDocResponse) {
          // Array para armazenar todas as solicitações de substituição
          var requests = [];
          // Adiciona uma solicitação para cada substituição fornecida
          let oldCodigo = 0;
          replacements.forEach(function (replacement) {
            // Adiciona uma solicitação para substituir o texto
            requests.push({
              replaceAllText: {
                containsText: {
                  text: replacement.oldText,
                  matchCase: true
                },
                replaceText: replacement.newText
              }
            });

            // código para os fiscais prolixos
            
            if (replacement.oldText === '{código}') {
              oldCodigo = parseInt(replacement.newText.length);
              //console.log('oldCodigo = replacement.newText.length: ' + oldCodigo)
            }

            if (parseInt(replacement.newText.length + oldCodigo) >= 627
              && parseInt(replacement.newText.length + oldCodigo) <= 950 ) {
                //console.log('replacement.newText.length + oldCodigo = ' + parseInt(replacement.newText.length + oldCodigo))
                requests.push({
                  updateTextStyle: {
                    range: {
                      startIndex: 404,  // substitua pelo índice inicial adequado
                      endIndex: 456+replacement.newText.length // substitua pelo índice final adequado
                    },
                    textStyle: {
                      fontSize: {
                        magnitude: 10,  // substitua pelo tamanho desejado
                        unit: 'PT'  // unidade de tamanho (pontos)
                      }
                    },
                    fields: 'fontSize'  // especifica os campos a serem atualizados (neste caso, apenas fontSize)
                  }
                });

            } else if (parseInt(replacement.newText.length + oldCodigo) > 950) {
              //console.log('replacement.newText.length + oldCodigo = ' + parseInt(replacement.newText.length + oldCodigo))
              requests.push({
                updateTextStyle: {
                  range: {
                    startIndex: 404,
                    endIndex: 456+replacement.newText.length
                  },
                  textStyle: {
                    fontSize: {
                      magnitude: 7.5,
                      unit: 'PT'
                    }
                  },
                  fields: 'fontSize'
                }
              });
            }
          });
          // Executa as solicitações de substituição no documento copiado
          gapi.client.docs.documents.batchUpdate({
            documentId: copyResponse.result.id,
            resource: {
              requests: requests
            }
          }).then(async function (updateResponse) {
            //console.log('Texto substituído na cópia com sucesso:', updateResponse.result);
            // Converte o documento para PDF

            urlDoLinkPdf = `https://docs.google.com/document/d/${copyResponse.result.id}/export?format=pdf`;
       
            await appendUrl();
          
          }).catch(function (updateError) {
            console.error('Erro ao substituir texto na cópia:', updateError);
          });

        }, function (getDocError) {
          console.error('Erro ao obter o corpo do documento:', getDocError);
        });
      }, function (copyError) {
        console.error('Erro ao criar cópia do documento:', copyError);
      });
    } else {
      console.error('Pasta filho não encontrada:', folderName);
    }
  }, function (folderError) {
    console.error('Erro ao buscar a pasta filho:', folderError);
  });

  $(".overlay-container").toggleClass("d-none");
}


async function appendUrl() {

  var codValue = document.getElementById('inputCodigo').value
  var anoValue = document.getElementById('inputDataAbertura').value.substring(0, 4)
  var rangeSheet = ''

  if (parseInt(anoValue) < 2024) {
    rangeSheet =  'Raw LF Old!A2:B'   
  } else {
    rangeSheet =  'Raw LF!T2:U'
  }

  var params = {
    spreadsheetId: '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM',
    range: rangeSheet
  };

  gapi.client.sheets.spreadsheets.values.get(params).then(function(response) {
    var values = response.result.values;

    // Procurar por 'proc' e 'ano' nas colunas T e U
    for (var i = 0; i < values.length; i++) {

      // Verificar se encontrou a linha
      if (codValue === values[i][parseInt(anoValue)<2024?0:1] && anoValue === values[i][parseInt(anoValue)<2024?1:0]) {

        // Encontrou a linha, agora atualizar a coluna 'AG' com 'salve-me'
        var rangeToUpdate = parseInt(anoValue)<2024?'Raw LF Old!V' + (i + 2):'Raw LF!AG' + (i + 2); // i + 2 porque os índices começam em 0 e a primeira linha é o cabeçalho
        var updateParams = {
          spreadsheetId: '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM',
          range: rangeToUpdate,
          valueInputOption: 'RAW',
          resource: {
            values: [[urlDoLinkPdf]]
          }
        };

        // Realizar a solicitação de atualização
        gapi.client.sheets.spreadsheets.values.update(updateParams).then(function(updateResponse) {
          //console.log('Link atualizado com sucesso:', updateResponse);
          const myModal = new bootstrap.Modal(document.getElementById('modalSaveSuccess'));
          myModal.show();
          $('#btnLink').prop('disabled', false);
          $("#inputStatus").val(verificarCondicaoLicenca());
        }, function(error) {
          console.error('Erro ao atualizar Link:', error);
        });

        // Parar o loop, pois já encontrou a linha
        break;
      }
    }
  }, function(error) {
    console.error('Erro ao obter valores:', error);
  });
}




// o valor máximo em Raw LF!W2:W
async function maxNumberOfNumLf() {
  $(".overlay-container").toggleClass("d-none");

  var anoValue = document.getElementById('inputDataAbertura').value.substring(0, 4)
  var rangeSheet = '';

  if (parseInt(anoValue) < 2024) {
    rangeSheet =  'Raw LF Old!C4446:C';  
  } else {
    rangeSheet =  'Raw LF!W2:W';
  }

  var params = {
    spreadsheetId: '1hvT8Ya6OjnaMln5tetI8KDieR_q7lHj6p_MPORD57xM',
    range: rangeSheet
  };

  try {
    const response = await gapi.client.sheets.spreadsheets.values.get(params);
    const values = response.result.values;

    if (values && values.length > 0) {
      // Inicialize o máximo com o primeiro valor na coluna W
      let maxNumber = parseFloat(values[0][0]);

      // Percorra os valores para encontrar o máximo
      for (let i = 1; i < values.length; i++) {
        const currentValue = parseFloat(values[i][0]);

        if (!isNaN(currentValue) && currentValue > maxNumber) {
          maxNumber = currentValue;
        }
      }

      var receptor = document.getElementById('inputLF');
      receptor.value === '' ?
      receptor.value = maxNumber+1 : '';
      //return maxNumber;
      //console.log('Maior +1 número na coluna W:', maxNumber, maxNumber+1);

    } else {
      console.log('Nenhum valor encontrado na coluna W, ou C.');
    }
  } catch (error) {
    console.error('Erro ao obter valores da planilha:', error);
  }
  $(".overlay-container").toggleClass("d-none");
}


/** Eventos auxiliares */
function eventoBuscar() { 
  $('.main-forms :input:not(#inputDivisao, #inputStatus, #inputRequisito)').prop('readonly', true);
  $('.main-forms select:not(#inputStatus, #inputRequisito)').each(function() {
    $(this).find('option').prop('disabled', true)});
  $('#btnEditar').prop('disabled', false);
  $('#dismissEditar').trigger('click');

  //verificar a validade do CPF ou CNPJ
  forcingOnInputEvent('inputCNP');
}

function eventoLimparForms() {
  $('.main-forms :input:not(#inputDivisao, #inputStatus, #inputRequisito)').prop('readonly',false);
  $('#btnEditar').prop('disabled', true);
  $('#btnPDF').prop('disabled', true);
}