/* ============================================================
   RAÍZES — Proteção Patrimonial Rural
   Script Oficial dos Simuladores Estratégicos · simulador.js
   Calculadora de Inventário & Comparativo Tributário da Safra (PF x PJ)
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

  // 4. Alternância de Abas (Tabs)
  initTabs();

  // 5. Inicialização dos Dois Simuladores
  initSimuladorInventario();
  initSimuladorTributario();
});

// ==================== TABS DE NAVEGAÇÃO ====================
function initTabs() {
  const tabBtns = document.querySelectorAll(".sim-tab-btn");
  const panels = document.querySelectorAll(".sim-panel");

  function switchTab(tabId) {
    tabBtns.forEach(b => {
      const active = b.getAttribute("data-tab") === tabId;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active);
    });
    panels.forEach(p => {
      const active = p.id === `panel-${tabId}`;
      p.classList.toggle("active", active);
    });
    // Atualiza a URL sem recarregar
    if (history.replaceState) {
      history.replaceState(null, "", `#${tabId}`);
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      switchTab(target);
    });
  });

  // Se a URL já tiver hash #tributario ou #inventario
  const hash = window.location.hash.replace("#", "");
  if (hash === "tributario" || hash === "inventario") {
    switchTab(hash);
  }
}

// ==================== UTILITÁRIO DE FORMATAÇÃO ====================
function formatMoney(num) {
  return Number(num || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  });
}

// ==================== 1. SIMULADOR DE INVENTÁRIO RURAL ====================
const ITCMD_UFS = {
  "MG": { nome: "Minas Gerais", aliquota: 0.05, desc: "Alíquota média/progressiva estadual em MG (5% a 8%)" },
  "SP": { nome: "São Paulo", aliquota: 0.04, desc: "Alíquota paulista (4% a 8% na progressão)" },
  "GO": { nome: "Goiás", aliquota: 0.06, desc: "Alíquota média em GO (4% a 8%)" },
  "MT": { nome: "Mato Grosso", aliquota: 0.04, desc: "Alíquota estadual no MT (2% a 8%)" },
  "MS": { nome: "Mato Grosso do Sul", aliquota: 0.06, desc: "Alíquota média no MS (3% a 8%)" },
  "PR": { nome: "Paraná", aliquota: 0.04, desc: "Alíquota fixa/progressiva no PR (4%)" },
  "RS": { nome: "Rio Grande do Sul", aliquota: 0.05, desc: "Alíquota progressiva no RS (4% a 6%)" },
  "BA": { nome: "Bahia", aliquota: 0.06, desc: "Alíquota progressiva na BA (3.5% a 8%)" },
  "TO": { nome: "Tocantins", aliquota: 0.05, desc: "Alíquota progressiva no TO (2% a 8%)" },
  "PA": { nome: "Pará", aliquota: 0.04, desc: "Alíquota estadual no PA (4%)" },
  "MA": { nome: "Maranhão", aliquota: 0.05, desc: "Alíquota progressiva no MA (3% a 7%)" },
  "OUTRO": { nome: "Outro Estado", aliquota: 0.05, desc: "Média nacional de ITCMD (5%)" }
};

function initSimuladorInventario() {
  const rangeInput = document.getElementById("page-sim-patrimonio");
  const ufSelect = document.getElementById("page-sim-uf");
  const displayVal = document.getElementById("page-display-patrimonio");
  const resPatrimonio = document.getElementById("page-res-patrimonio");
  const resItcmd = document.getElementById("page-res-itcmd");
  const resCustas = document.getElementById("page-res-custas");
  const resPerdaTotal = document.getElementById("page-res-perda-total");
  const resEconomia = document.getElementById("page-res-economia");
  const btnEnviarSim = document.getElementById("page-btn-wa-inv");
  const presetBtns = document.querySelectorAll(".btn-preset-patr");

  if (!rangeInput || !ufSelect) return;

  function update() {
    const valor = parseFloat(rangeInput.value);
    const ufKey = ufSelect.value || "MG";
    const ufData = ITCMD_UFS[ufKey] || ITCMD_UFS["MG"];

    if (displayVal) displayVal.textContent = formatMoney(valor);
    if (resPatrimonio) resPatrimonio.textContent = formatMoney(valor);

    // Cálculos do inventário tradicional
    const itcmd = valor * ufData.aliquota;
    const custasHonorarios = valor * 0.10; // ~3% custas cartorárias + ~7% honorários tabela OAB
    const perdaTotal = itcmd + custasHonorarios;

    // Estimativa com planejamento em vida (~3.5% a 4% com ganho tributário expressivo)
    const custoPlanejado = valor * 0.04;
    const economiaEstimada = Math.max(0, perdaTotal - custoPlanejado);

    if (resItcmd) resItcmd.textContent = formatMoney(itcmd);
    if (resCustas) resCustas.textContent = formatMoney(custasHonorarios);
    if (resPerdaTotal) resPerdaTotal.textContent = `~ ${formatMoney(perdaTotal)}`;
    if (resEconomia) resEconomia.textContent = `~ ${formatMoney(economiaEstimada)}`;

    if (btnEnviarSim) {
      const msg = `Olá! Fiz a simulação de inventário no site da Raízes para um patrimônio rural de ${formatMoney(valor)} em ${ufData.nome}. Gostaria de entender como a holding familiar e o planejamento em vida evitam essa perda de ${formatMoney(perdaTotal)} no inventário.`;
      btnEnviarSim.href = `https://wa.me/5532920004387?text=${encodeURIComponent(msg)}`;
    }
  }

  rangeInput.addEventListener("input", update);
  ufSelect.addEventListener("change", update);

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-val");
      if (v) {
        rangeInput.value = v;
        update();
      }
    });
  });

  update();
}

// ==================== 2. SIMULADOR TRIBUTÁRIO DA SAFRA (PF x PJ) ====================
function initSimuladorTributario() {
  const rangeInput = document.getElementById("page-sim-receita");
  const regimeSelect = document.getElementById("page-sim-regime-pf");
  const displayVal = document.getElementById("page-display-receita");
  const displayRegimeDesc = document.getElementById("page-display-regime-desc");
  const presetBtns = document.querySelectorAll(".btn-preset-receita");

  // Campos PF
  const pfBase = document.getElementById("page-pf-base");
  const pfIrpf = document.getElementById("page-pf-irpf");
  const pfFunrural = document.getElementById("page-pf-funrural");
  const pfTotal = document.getElementById("page-pf-total");
  const pfAliquota = document.getElementById("page-pf-aliquota");

  // Campos PJ
  const pjIrpj = document.getElementById("page-pj-irpj");
  const pjCsll = document.getElementById("page-pj-csll");
  const pjPisCofins = document.getElementById("page-pj-piscofins");
  const pjFunrural = document.getElementById("page-pj-funrural");
  const pjTotal = document.getElementById("page-pj-total");
  const pjAliquota = document.getElementById("page-pj-aliquota");

  // Banner Economia
  const safraEconomiaVal = document.getElementById("page-safra-economia-val");
  const safraEconomiaPct = document.getElementById("page-safra-economia-pct");
  const btnEnviarTrib = document.getElementById("page-btn-wa-trib");

  if (!rangeInput) return;

  function update() {
    const receita = parseFloat(rangeInput.value) || 5000000;
    const regime = regimeSelect ? regimeSelect.value : "arbitrado";

    if (displayVal) displayVal.textContent = formatMoney(receita);

    // 1. CÁLCULO PESSOA FÍSICA (PF)
    let margemLucroPf = 0.20; // Padrão Lei 8.023/90 (20% arbitrado)
    if (regime === "livro_caixa_alto") {
      margemLucroPf = 0.35; // Produtores com alta margem líquida (35%)
      if (displayRegimeDesc) displayRegimeDesc.textContent = "Livro Caixa (Margem Líquida Real estimada em 35%)";
    } else {
      if (displayRegimeDesc) displayRegimeDesc.textContent = "Arbitramento Legal (20% da Receita Bruta — Art. 4º Lei 8.023/90)";
    }

    const basePf = receita * margemLucroPf;
    const irpfPf = basePf * 0.275; // Alíquota máxima progressiva
    const funruralPf = receita * 0.015; // 1,5% Funrural comercialização PF (Previdência + Senar)
    const totalPf = irpfPf + funruralPf;
    const aliqEfetivaPf = (totalPf / receita) * 100;

    // 2. CÁLCULO PESSOA JURÍDICA (PJ RURAL NO LUCRO PRESUMIDO)
    // IRPJ: Base de 8% da receita bruta agropecuária
    const baseIrpj = receita * 0.08;
    const irpjBasico = baseIrpj * 0.15;
    const adicionalIrpj = Math.max(0, (baseIrpj - 240000) * 0.10);
    const irpjTotal = irpjBasico + adicionalIrpj;

    // CSLL: Base de 12% da receita bruta
    const baseCsll = receita * 0.12;
    const csllTotal = baseCsll * 0.09;

    // PIS/COFINS Agro: Regime cumulativo (3,65%), mas na cadeia do agro diversas safras
    // gozam de suspensão/alíquota zero parcial (Lei 10.925/04). Média líquida efetiva ~1.5%
    const pisCofinsTotal = receita * 0.015;

    // Funrural PJ: 1,5% sobre a receita comercializada (ou opção folha)
    const funruralPj = receita * 0.015;

    const totalPj = irpjTotal + csllTotal + pisCofinsTotal + funruralPj;
    const aliqEfetivaPj = (totalPj / receita) * 100;

    // Economia Safra
    const economiaAnual = Math.max(0, totalPf - totalPj);
    const economiaPct = totalPf > 0 ? Math.round((economiaAnual / totalPf) * 100) : 0;

    // Atualiza DOM PF
    if (pfBase) pfBase.textContent = formatMoney(basePf);
    if (pfIrpf) pfIrpf.textContent = formatMoney(irpfPf);
    if (pfFunrural) pfFunrural.textContent = formatMoney(funruralPf);
    if (pfTotal) pfTotal.textContent = formatMoney(totalPf);
    if (pfAliquota) pfAliquota.textContent = `(${aliqEfetivaPf.toFixed(1).replace(".", ",")}%)`;

    // Atualiza DOM PJ
    if (pjIrpj) pjIrpj.textContent = formatMoney(irpjTotal);
    if (pjCsll) pjCsll.textContent = formatMoney(csllTotal);
    if (pjPisCofins) pjPisCofins.textContent = formatMoney(pisCofinsTotal);
    if (pjFunrural) pjFunrural.textContent = formatMoney(funruralPj);
    if (pjTotal) pjTotal.textContent = formatMoney(totalPj);
    if (pjAliquota) pjAliquota.textContent = `(${aliqEfetivaPj.toFixed(1).replace(".", ",")}%)`;

    // Atualiza Banner Economia
    if (safraEconomiaVal) safraEconomiaVal.textContent = `~ ${formatMoney(economiaAnual)} / ano`;
    if (safraEconomiaPct) safraEconomiaPct.textContent = `Economia de aprox. ${economiaPct}% da carga de impostos da atividade rural.`;

    if (btnEnviarTrib) {
      const msg = `Olá! Fiz a simulação tributária da safra no site da Raízes para uma receita anual de ${formatMoney(receita)}. O comparativo indicou uma economia anual estimada de ${formatMoney(economiaAnual)} entre Pessoa Física e Jurídica Rural. Gostaria de entender como estruturar o planejamento tributário das minhas lavouras.`;
      btnEnviarTrib.href = `https://wa.me/5532920004387?text=${encodeURIComponent(msg)}`;
    }
  }

  rangeInput.addEventListener("input", update);
  if (regimeSelect) regimeSelect.addEventListener("change", update);

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-val");
      if (v) {
        rangeInput.value = v;
        update();
      }
    });
  });

  update();
}
