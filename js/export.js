// js/export.js
export function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val =
          row[h] === undefined || row[h] === null ? "" : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(data, filename = "export.xlsx") {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  const sheetXml = excelSheet(data);
  const workbookXml = excelWorkbook(sheetXml);
  const blob = new Blob([workbookXml], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function excelSheet(data) {
  const headers = Object.keys(data[0]);
  const rows = [headers, ...data.map((r) => headers.map((h) => r[h] ?? ""))];
  let sheet = `<?xml version="1.0"?>`;
  sheet += `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`;
  rows.forEach((row, i) => {
    sheet += `<row r="${i + 1}">`;
    row.forEach((cell, j) => {
      const col = String.fromCharCode(65 + j);
      const value = String(cell).replace(/&/g, "&amp;").replace(/</g, "&lt;");
      sheet += `<c r="${col}${
        i + 1
      }" t="inlineStr"><is><t>${value}</t></is></c>`;
    });
    sheet += `</row>`;
  });
  sheet += `</sheetData></worksheet>`;
  return sheet;
}
function excelWorkbook(sheetXml) {
  const wb = `<?xml version="1.0" encoding="UTF-8"?>
  <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <sheets><sheet name="Sheet1" sheetId="1"/></sheets>
  </workbook>
  ${sheetXml}`;
  return wb;
}
