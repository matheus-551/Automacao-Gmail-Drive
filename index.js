var scriptProperties = PropertiesService.getScriptProperties();

function getDriveFolder() {
  var folderId = scriptProperties.getProperty("FOLDER_DRIVE_ID");

  if (!folderId) {
    throw new Error("ID da pasta do Google Drive não encontrado.");
  }

  return DriveApp.getFolderById(folderId);
}

function getEmailNotification() {
  var email = scriptProperties.getProperty("EMAIL_TO");

  if(!email) {
    throw new Error("Email de notificação não encontrado.");
  }

  return email;
}

function getSubject() {
  var subject = scriptProperties.getProperty("SUBJECT");

  if(!subject) {
    throw new Error("Email de notificação não encontrado.");
  }

  return subject;
}

function processAttachments() {
  Logger.log("processAttachments -> Start");

  var folder = getDriveFolder();
  var desiredSubject = getSubject();
  var listNewFiles = [];

  var fileAlreadyExists = false;
  var threads = GmailApp.search('subject:"' + desiredSubject + '" has:attachment', 0, 5);
  
  for (var i = 0; i < threads.length && !fileAlreadyExists; i++) {
    var messages = threads[i].getMessages();
    
    for (var j = 0; j < messages.length && !fileAlreadyExists; j++) {
      Logger.log(messages[j].getSubject());
      var attachments = messages[j].getAttachments();
      
      for (var k = 0; k < attachments.length; k++) {
        var attachment = attachments[k];

        if (!fileExists(folder, attachment.getName())) {
          folder.createFile(attachment);
          listNewFiles.push(attachment.getName())
          Logger.log("Anexo salvo no Google Drive.");
        } else {
          Logger.log("O anexo já existe no Drive. Nenhuma ação necessária.");
          fileAlreadyExists = true;
          break;
        }
      }
    }
  }

  sendFileListEmail(listNewFiles);

  Logger.log("processAttachments -> End");
}

function fileExists(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  return files.hasNext();
}

function sendFileListEmail(files) {
  var email = getEmailNotification();

  var body = "Arquivos adicionados ao drive:\n \n" + files.join("\n \n");

  MailApp.sendEmail(email, "Novos Arquivos Disponível no Google Drive", body);
}
