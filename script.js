const { jsPDF } = window.jspdf;

// Função formatar data
function formatDate(dateStr) {
  const meses = ["janeiro","fevereiro","março","abril","maio","junho",
                 "julho","agosto","setembro","outubro","novembro","dezembro"];
  const d = new Date(dateStr);
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// Mostrar campo CPF
document.getElementById("cpfCheck").addEventListener("change", e => {
  document.getElementById("cpfField").style.display = e.target.checked ? "block" : "none";
});

// Configurar assinatura digital
const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mousemove", draw);
document.getElementById("clearSignature").addEventListener("click", clearSignature);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}
function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Gerar PDF
document.getElementById("declarationForm").addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("teacherName").value.trim();
  const sexo = document.getElementById("sexo").value;
  const vinculo = document.getElementById("vinculo").value;
  const cpfCheck = document.getElementById("cpfCheck").checked;
  const cpf = document.getElementById("cpf").value.trim();
  const dateValue = document.getElementById("lessonDate").value;
  const modelo = document.querySelector('input[name="modelo"]:checked').value;
  const customText = document.getElementById("customText").value.trim();
  const diretora = document.getElementById("diretora").value.trim();

  if (!name || !sexo || !vinculo || !dateValue || !diretora) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const bg = await loadImage("background.png");
  doc.addImage(bg, "PNG", 0, 0, pageWidth, pageHeight);

  const artigo = sexo === "Masculino" ? "o Professor" : "a Professora";
  const cpfTxt = cpfCheck && cpf ? `, portador${sexo === "Feminino" ? "a" : ""} do CPF nº ${cpf}` : "";
  const dataFmt = formatDate(dateValue);

  let corpo = "";

  if (modelo === "ausencia") {
    corpo = `Declaro, para os devidos fins de prova, que ${artigo} ${name}${cpfTxt}, não compareceu ao planejamento marcado para o dia ${dataFmt}, uma vez que ministrou aulas durante o horário correspondente nesta instituição de ensino.${customText ? " " + customText : ""} Solicitamos a compreensão de todos quanto à ausência do(a) professor(a) nesta ocasião.`;
  } else {
    corpo = `Declaramos, para os devidos fins, que ${artigo.toLowerCase()} ${name}${cpfTxt}, ${vinculo.toLowerCase()} desta instituição, exerceu suas atividades docentes com dedicação e compromisso no dia ${dataFmt}.${customText ? " " + customText : ""}`;
  }

  // Texto no PDF
  doc.setFont("Times", "Normal");
  doc.setFontSize(12);
  const margin = 25;
  const maxWidth = pageWidth - margin * 2;
  const lines = doc.splitTextToSize(corpo, maxWidth);
  doc.text(lines, margin, 125, { align: "justify" });

  const hoje = formatDate(new Date().toISOString());
  doc.text(`Sítio Oiticica, Frecheirinha/CE, ${hoje}.`, pageWidth - margin, 180, { align: "right" });

  // Assinatura digital
  const signatureData = canvas.toDataURL("image/png");
  if (signatureData && signatureData !== "data:,") {
    doc.addImage(signatureData, "PNG", pageWidth/2 - 30, 200, 60, 25);
  }

  // Linha e nome da diretora
  doc.setFont("Times", "Bold");
  doc.text("_____________________________________", pageWidth / 2, 250, { align: "center" });
  doc.text(diretora, pageWidth / 2, 257, { align: "center" });
  doc.setFont("Times", "Normal");
  doc.text("Diretora", pageWidth / 2, 263, { align: "center" });

  // Preview
  const blobUrl = doc.output("bloburl");
  document.getElementById("pdfPreview").src = blobUrl;
  document.getElementById("previewContainer").style.display = "block";
  document.getElementById("downloadBtn").onclick = () =>
    doc.save(`Declaracao_${name.replace(/\s+/g, "_")}.pdf`);
});

// Função carregar imagem
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
