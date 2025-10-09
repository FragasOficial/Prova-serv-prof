// === Declaração - com plano de fundo oficial ===
const { jsPDF } = window.jspdf;

function formatDate(dateStr) {
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  const data = new Date(dateStr);
  return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

document.getElementById("declarationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const dob = document.getElementById("dob").value;
  const father = document.getElementById("fatherName").value.trim();
  const mother = document.getElementById("motherName").value.trim();
  const grade = document.getElementById("grade").value.trim();
  const section = document.getElementById("section").value.trim();
  const turno = document.getElementById("studentTurno").value;

  const turnoText =
    turno === "manha" ? "turno manhã" :
    turno === "tarde" ? "turno tarde" :
    "turnos manhã e tarde";

  const dataAtual = new Date();
  const dataFormatada = formatDate(dataAtual.toISOString());

  const corpo = `
Declaramos, para os devidos fins de prova e efeitos legais, que temos vaga no ${grade}º ano ${section}, ${turnoText}, para o(a) aluno(a) ${studentName.toUpperCase()}, nascido(a) em ${formatDate(dob)}${(father || mother) ? ", filho(a) de " + [father, mother].filter(Boolean).join(" e ") : ""}.

O referido é verdade e dou fé.
`;

  // === Gerando PDF ===
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === Inserir imagem de fundo ===
  const bgImg = await loadImage("background.png");
  doc.addImage(bgImg, "PNG", 0, 0, pageWidth, pageHeight);

  // === Corpo da declaração ===
  doc.setFont("Times", "Normal");
  doc.setFontSize(12);
  doc.text(corpo.trim(), 25, 130, { maxWidth: 160, align: "justify" });

  
  // === Local e Data ===
  doc.text(`Oiticica, Frecheirinha/CE, ${dataFormatada}.`, 102, 175);

  // === Pré-visualização ===
  const pdfData = doc.output("bloburl");
  const preview = document.getElementById("pdfPreview");
  const container = document.getElementById("previewContainer");
  preview.src = pdfData;
  container.style.display = "block";

  // === Download ===
  document.getElementById("downloadBtn").onclick = () => {
    doc.save(`Declaracao_Vaga_${studentName.replace(/\s+/g, "_")}.pdf`);
  };
});

// Função para carregar imagem
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
