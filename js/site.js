/* ============================================================
   RAÍZES — Proteção Patrimonial Rural
   Script Oficial Institucional · site.js
   Menu, Máscaras, Simulador Interativo e Validação
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Menu Mobile
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen);
    });

    // Fecha ao clicar em um link
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 2. Header Scrolled Effect
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  }, { passive: true });

  // 3. Ano no Rodapé
  const anoSpan = document.getElementById("ano");
  if (anoSpan) {
    anoSpan.textContent = new Date().getFullYear();
  }

  // 4. Máscara de Telefone no Formulário
  const telInputs = document.querySelectorAll('input[type="tel"]');
  telInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      e.target.value = v;
    });
  });

  // 5. SIMULADOR INTERATIVO DE INVENTÁRIO RURAL
  initSimulador();

  // 6. FORMULÁRIO DE AGENDAMENTO CONFIDENCIAL
  initFormContato();
});

// Dados de alíquotas médias e teto de ITCMD por UF
const ITCMD_UFS = {
  "MG": { nome: "Minas Gerais", aliquota: 0.05, desc: "Alíquota média/progressiva estadual em MG (5% a 8%)" },
  "SP": { nome: "São Paulo", aliquota: 0.04, desc: "Alíquota paulista (4% a 8% na progressão)" },
  "GO": { nome: "Goiás", aliquota: 0.06, desc: "Alíquota média em GO (4% a 8%)" },
  "MT": { nome: "Mato Grosso", aliquota: 0.04, desc: "Alíquota estadual no MT (2% a 8%)" },
  "MS": { nome: "Mato Grosso do Sul", aliquota: 0.06, desc: "Alíquota média no MS (3% a 8%)" },
  "PR": { nome: "Paraná", aliquota: 0.04, desc: "Alíquota fixa/progressiva no PR (4%)" },
  "RS": { nome: "Rio Grande do Sul", aliquota: 0.05, desc: "Alíquota progressiva no RS (4% a 6%)" },
  "BA": { nome: "Bahia", aliquota: 0.06, desc: "Alíquota progressiva na BA (3.5% a 8%)" },
  "OUTRO": { nome: "Outro Estado", aliquota: 0.05, desc: "Média nacional de ITCMD (5%)" }
};

function formatMoney(num) {
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function initSimulador() {
  const rangeInput = document.getElementById("sim-patrimonio");
  const ufSelect = document.getElementById("sim-uf");
  const displayVal = document.getElementById("display-patrimonio");
  const resPatrimonio = document.getElementById("res-patrimonio");
  const resItcmd = document.getElementById("res-itcmd");
  const resCustas = document.getElementById("res-custas");
  const resPerdaTotal = document.getElementById("res-perda-total");
  const resEconomia = document.getElementById("res-economia");
  const btnEnviarSim = document.getElementById("btn-enviar-sim");

  if (!rangeInput || !ufSelect) return;

  function update() {
    const valor = parseFloat(rangeInput.value);
    const ufKey = ufSelect.value || "MG";
    const ufData = ITCMD_UFS[ufKey] || ITCMD_UFS["MG"];

    if (displayVal) displayVal.textContent = formatMoney(valor);
    if (resPatrimonio) resPatrimonio.textContent = formatMoney(valor);

    // Cálculos do inventário tradicional
    // 1. ITCMD estadual
    const itcmd = valor * ufData.aliquota;
    // 2. Custas cartorárias/judiciais (~3%) + honorários advocatícios padrão OAB em inventário (~7%)
    const custasHonorarios = valor * 0.10;
    // 3. Perda total tradicional estimada
    const perdaTotal = itcmd + custasHonorarios;

    // Estimativa de custo estruturação com planejamento em vida (~3.5% a 5% com ganho tributário expressivo)
    const custoPlanejado = valor * 0.04;
    const economiaEstimada = Math.max(0, perdaTotal - custoPlanejado);

    if (resItcmd) resItcmd.textContent = formatMoney(itcmd);
    if (resCustas) resCustas.textContent = formatMoney(custasHonorarios);
    if (resPerdaTotal) resPerdaTotal.textContent = `~ ${formatMoney(perdaTotal)}`;
    if (resEconomia) resEconomia.textContent = `~ ${formatMoney(economiaEstimada)}`;

    // Atualiza link de WhatsApp do simulador
    if (btnEnviarSim) {
      const msg = `Olá! Fiz a simulação no site da Raízes para um patrimônio rural de ${formatMoney(valor)} em ${ufData.nome}. Gostaria de entender como o planejamento patrimonial e a holding familiar evitam essa perda de ${formatMoney(perdaTotal)} no inventário.`;
      btnEnviarSim.href = `https://wa.me/5532920004387?text=${encodeURIComponent(msg)}`;
    }
  }

  rangeInput.addEventListener("input", update);
  ufSelect.addEventListener("change", update);
  update(); // Execução inicial
}

function initFormContato() {
  const form = document.getElementById("form-agendamento");
  const feedback = document.getElementById("form-feedback");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = form.nome?.value.trim();
    const tel = form.telefone?.value.trim();
    const cidade = form.cidade?.value.trim();
    const cultura = form.cultura?.value;
    const area = form.area?.value.trim();
    const mensagem = form.mensagem?.value.trim();
    const consent = form.consent?.checked;

    if (!nome || !tel) {
      showFeedback("Por favor, preencha seu nome e WhatsApp de contato.", false);
      return;
    }

    if (!consent) {
      showFeedback("É necessário concordar com os termos de sigilo e privacidade para prosseguir.", false);
      return;
    }

    // Monta mensagem para atendimento prioritário no WhatsApp
    let textoWhats = `*Solicitação de Diagnóstico — Raízes Proteção Patrimonial Rural*\n\n`;
    textoWhats += `*Nome:* ${nome}\n`;
    textoWhats += `*WhatsApp:* ${tel}\n`;
    if (cidade) textoWhats += `*Localização da Fazenda:* ${cidade}\n`;
    if (cultura) textoWhats += `*Atividade Principal:* ${cultura}\n`;
    if (area) textoWhats += `*Área Aproximada:* ${area}\n`;
    if (mensagem) textoWhats += `*Objetivo/Dúvida:* ${mensagem}\n`;

    showFeedback("Informações validadas! Redirecionando para a conversa confidencial no WhatsApp...", true);

    setTimeout(() => {
      window.open(`https://wa.me/5532920004387?text=${encodeURIComponent(textoWhats)}`, "_blank");
      form.reset();
    }, 1200);
  });

  function showFeedback(msg, isOk) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = `form-feedback ${isOk ? "ok" : "err"}`;
    feedback.style.display = "block";
  }
}
