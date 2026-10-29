/* ============================================================
   RAÍZES — Avaliação de Fazendas e Imóveis Rurais
   Script da Landing Page · Alta Conversão · Lead Capture
   Rastreamento Tríplice: Form + WhatsApp Direto + Mobile Bar
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Ano dinâmico no rodapé
  const anoSpan = document.getElementById('ano');
  if (anoSpan) anoSpan.textContent = new Date().getFullYear();

  // Configuração padrão do WhatsApp de atendimento (DDD + Número)
  const WA_DEFAULT_NUMBER = "5532920004387"; 

  // Máscara de Telefone / WhatsApp (XX) XXXXX-XXXX
  const telInputs = document.querySelectorAll('input[type="tel"]');
  telInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 10) {
        e.target.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 6) {
        e.target.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        e.target.value = `(${v}`;
      } else {
        e.target.value = '';
      }
    });
  });

  // Rastreamento de Conversão em Cliques Diretos no WhatsApp (Perry Marshall §1.3)
  // Garante que o Google Ads registre como conversão quem clica no botão sem preencher o form
  const waButtons = document.querySelectorAll('a[href*="wa.me"]');
  waButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const label = btn.getAttribute('aria-label') || btn.innerText.trim() || 'WhatsApp Direto';
      
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'click_whatsapp', {
          event_category: 'Engenharia de Avaliações',
          event_label: label,
          value: 1.0
        });
      }
    });
  });

  // Manipulação do Formulário de Qualificação
  const leadForm = document.getElementById('form-avaliacao');
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = leadForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando estimativa...';

      // Coleta de dados
      const formData = new FormData(leadForm);
      const objetivo = formData.get('objetivo') || 'Não especificado';
      const municipio = formData.get('municipio') || 'Minas Gerais';
      const area = formData.get('area') || 'A informar';
      const aptidao = formData.get('aptidao') || 'Geral / Mista';
      const nome = formData.get('nome') || 'Produtor Rural';
      const whatsapp = formData.get('whatsapp') || '';

      // Monta texto estruturado para o WhatsApp
      const waText = encodeURIComponent(
        `Olá! Preenchi o formulário no site da Raízes e gostaria de uma estimativa para avaliação de fazenda:\n\n` +
        `• *Objetivo:* ${objetivo}\n` +
        `• *Município/Região:* ${municipio} (MG)\n` +
        `• *Área estimada:* ${area}\n` +
        `• *Aptidão:* ${aptidao}\n` +
        `• *Nome:* ${nome}\n` +
        `• *WhatsApp:* ${whatsapp}`
      );

      // Disparo de evento do Google Ads
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'Engenharia de Avaliações',
          event_label: objetivo,
          value: 1.0
        });
      }

      // Se houver chave do Web3Forms, envia por trás para registro em e-mail
      const accessKey = formData.get('access_key');
      if (accessKey && accessKey !== 'YOUR_ACCESS_KEY') {
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });
        } catch (err) {
          console.warn('Registro de formulário externo ignorado ou em fallback:', err);
        }
      }

      // Salva no sessionStorage para ler na página de agradecimento
      try {
        sessionStorage.setItem('raizes_lead_nome', nome);
        sessionStorage.setItem('raizes_lead_objetivo', objetivo);
        sessionStorage.setItem('raizes_lead_municipio', municipio);
      } catch (err) {}

      // Redireciona para obrigado.html passando parâmetros para carregar o WhatsApp lá
      const redirectUrl = `obrigado.html?nome=${encodeURIComponent(nome)}&msg=${waText}`;
      window.location.href = redirectUrl;
    });
  }
});
