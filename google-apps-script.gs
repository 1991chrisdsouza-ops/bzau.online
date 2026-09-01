const SHEET_NAME = 'Claims';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!data.fullMobile || !/^\+\d{9,12}$/.test(data.fullMobile)) return json({ok:false,message:'Invalid mobile number.'});
    const sheet = getClaimsSheet();
    const duplicate = sheet.getLastRow() > 1 && sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getDisplayValues().flat().includes(data.fullMobile);
    if (!duplicate) sheet.appendRow([new Date(), data.countryCode || '', data.mobile || '', data.fullMobile, data.campaign || '', data.utm_source || '', data.utm_medium || '', data.utm_campaign || '', data.utm_content || '', data.utm_term || '', data.fbclid || '', data.pageUrl || '']);
    return json({ok:true,duplicate:duplicate});
  } catch (error) {
    return json({ok:false,message:'Submission could not be saved.'});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function getClaimsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp','Country Code','Mobile','Full Mobile','Campaign','UTM Source','UTM Medium','UTM Campaign','UTM Content','UTM Term','FBCLID','Page URL']);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,12).setFontWeight('bold').setBackground('#230844').setFontColor('#ffffff');
  }
  return sheet;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
