/**
 * Raízes Proteção Patrimonial Rural — Diagnóstico Patrimonial, Familiar e Sucessório (EVPF)
 * Baseado nas Planilhas OURO, Script Rural, Avaliação do Legado (Mód. 04) e Governança (Mód. 05).
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'raizes_diagnostico_v1';
  var WA_NUMBER = '5532920004387';

  // ==================== UTILITÁRIOS ====================

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseBRL(val) {
    if (!val) return 0;
    var s = String(val).replace(/[^\d,.-]/g, '').trim();
    if (!s) return 0;
    // Se tiver vírgula como separador decimal (padrão BR: 1.500.000,00)
    if (s.indexOf(',') > -1) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Se tiver múltiplos pontos (ex.: 1.500.000), remove pontos
      var parts = s.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        s = s.replace(/\./g, '');
      }
    }
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  function formatBRL(num) {
    var n = Number(num) || 0;
    return n.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    });
  }

  function formatMoneyInput(input) {
    var v = parseBRL(input.value);
    if (v > 0) {
      input.value = v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  }

  // ==================== MENU MOBILE ====================

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var links = document.getElementById('menu-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
    var anoEl = document.getElementById('ano');
    if (anoEl) anoEl.textContent = new Date().getFullYear();
  }

  // ==================== TEMPLATES DOS REPEATERS ====================

  function tplHerdeiro(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="herdeiros">' +
        '<div class="repeater-item-top">' +
          '<strong>Familiar / Herdeiro #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Nome Completo</label>' +
            '<input type="text" data-f="nome" value="' + esc(d.nome) + '" placeholder="Ex.: Lucas Oliveira">' +
          '</div>' +
          '<div class="field">' +
            '<label>Vínculo Familiar</label>' +
            '<select data-f="vinculo">' +
              opt('Filho(a) comum do casal', d.vinculo) +
              opt('Filho(a) exclusivo do Titular 1', d.vinculo) +
              opt('Filho(a) exclusivo do Titular 2', d.vinculo) +
              opt('Neto(a)', d.vinculo) +
              opt('Genro / Nora', d.vinculo) +
              opt('Irmão(ã) / Sobrinho(a)', d.vinculo) +
              opt('Outro familiar', d.vinculo) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Data de Nasc. / Idade</label>' +
            '<input type="text" data-f="idade" inputmode="numeric" value="' + esc(d.idade) + '" placeholder="Ex.: 34 anos">' +
          '</div>' +
          '<div class="field">' +
            '<label>Profissão / Formação</label>' +
            '<input type="text" data-f="profissao" value="' + esc(d.profissao) + '" placeholder="Ex.: Eng. Agrônomo / Médico">' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Estado Civil</label>' +
            '<select data-f="estado_civil">' +
              opt('Casado(a)', d.estado_civil) +
              opt('Solteiro(a)', d.estado_civil) +
              opt('União Estável', d.estado_civil) +
              opt('Divorciado(a)', d.estado_civil) +
              opt('Viúvo(a)', d.estado_civil) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Regime de Bens (se casado)</label>' +
            '<select data-f="regime_bens">' +
              opt('Comunhão Parcial de Bens', d.regime_bens) +
              opt('Separação Total de Bens', d.regime_bens) +
              opt('Comunhão Universal de Bens', d.regime_bens) +
              opt('Não aplicável (Solteiro)', d.regime_bens) +
              opt('Não sei informar', d.regime_bens) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Nome do Cônjuge e Nº de Filhos (Netos)</label>' +
            '<input type="text" data-f="conjuge_filhos" value="' + esc(d.conjuge_filhos) + '" placeholder="Ex.: Casado c/ Mariana, 2 filhos">' +
          '</div>' +
          '<div class="field">' +
            '<label>Atua no Negócio Rural?</label>' +
            '<select data-f="atua_agro">' +
              opt('Sim, dedicação integral', d.atua_agro) +
              opt('Sim, dedicação parcial / apoio', d.atua_agro) +
              opt('Não, atua em outra área / mora fora', d.atua_agro) +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-3">' +
          '<div class="field">' +
            '<label>É candidato a Sucessor da Gestão?</label>' +
            '<select data-f="sucessor">' +
              opt('Sim, principal sucessor operacional', d.sucessor) +
              opt('Sim, em conjunto com irmãos', d.sucessor) +
              opt('Não (apenas sócio/herdeiro patrimonial)', d.sucessor) +
              opt('Em avaliação', d.sucessor) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Já recebeu doação / adiantamento de herança?</label>' +
            '<select data-f="adiantamento">' +
              opt('Não', d.adiantamento) +
              opt('Sim (imóvel, quotas ou valor financeiro)', d.adiantamento) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Observações (harmonia, expectativas, restrições)</label>' +
            '<input type="text" data-f="obs" value="' + esc(d.obs) + '" placeholder="Ex.: Cuida da compra de insumos e café">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplImovel(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="imoveis">' +
        '<div class="repeater-item-top">' +
          '<strong>Imóvel Rural / Urbano #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Nome da Fazenda / Identificação do Imóvel</label>' +
            '<input type="text" data-f="nome" value="' + esc(d.nome) + '" placeholder="Ex.: Fazenda Cachoeira - Gleba A">' +
          '</div>' +
          '<div class="field">' +
            '<label>Natureza do Imóvel</label>' +
            '<select data-f="natureza">' +
              opt('Rural', d.natureza) +
              opt('Urbano', d.natureza) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Município e UF</label>' +
            '<input type="text" data-f="municipio_uf" value="' + esc(d.municipio_uf) + '" placeholder="Ex.: Patrocínio / MG">' +
          '</div>' +
          '<div class="field">' +
            '<label>Matrícula nº e Cartório (CRI)</label>' +
            '<input type="text" data-f="matricula" value="' + esc(d.matricula) + '" placeholder="Ex.: Mat. 14.230 - CRI Patrocínio">' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Titular / Proprietário Atual na Matrícula</label>' +
            '<select data-f="titularidade">' +
              opt('Pessoa Física — Casal (Plena propriedade)', d.titularidade) +
              opt('Pessoa Física — Somente um dos cônjuges', d.titularidade) +
              opt('Condomínio com irmãos / filhos / outros', d.titularidade) +
              opt('Doado aos filhos com Reserva de Usufruto', d.titularidade) +
              opt('Em nome de Pessoa Jurídica (CNPJ)', d.titularidade) +
              opt('Apenas Escritura sem registro ou Posse', d.titularidade) +
              opt('Em nome de terceiros', d.titularidade) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Área Total (numérico)</label>' +
            '<input type="text" data-f="area" inputmode="decimal" value="' + esc(d.area) + '" placeholder="Ex.: 280">' +
            '<span class="alqueire-hint" data-area-hint></span>' +
          '</div>' +
          '<div class="field">' +
            '<label>Unidade de Área</label>' +
            '<select data-f="unidade_area">' +
              opt('ha (hectares)', d.unidade_area) +
              opt('alqueires', d.unidade_area) +
              opt('m² (urbano)', d.unidade_area) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Ano e Forma de Aquisição</label>' +
            '<input type="text" data-f="ano_aquisicao" inputmode="numeric" value="' + esc(d.ano_aquisicao) + '" placeholder="Ex.: 1998 (Compra) / 2010 (Herança)">' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Valor Estimado de Mercado (R$)</label>' +
            '<input type="text" data-f="valor_mercado" data-money inputmode="decimal" value="' + esc(d.valor_mercado) + '" placeholder="Ex.: 12.000.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Declarado no IRPF (R$)</label>' +
            '<input type="text" data-f="valor_dirpf" data-money inputmode="decimal" value="' + esc(d.valor_dirpf) + '" placeholder="Ex.: 950.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor VTN / ITR ou Venal IPTU (R$)</label>' +
            '<input type="text" data-f="valor_itr" data-money inputmode="decimal" value="' + esc(d.valor_itr) + '" placeholder="Ex.: 4.800.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Alíquota ITBI Municipal (%)</label>' +
            '<input type="text" data-f="aliquota_itbi" inputmode="decimal" value="' + esc(d.aliquota_itbi || '2,0%') + '" placeholder="Ex.: 2,0% ou 3,0%">' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Exploração / Utilização Principal</label>' +
            '<select data-f="utilizacao">' +
              opt('Exploração própria (Lavoura / Café / Pecuária)', d.utilizacao) +
              opt('Arrendamento Rural para terceiros', d.utilizacao) +
              opt('Parceria Agrícola ou Pecuária', d.utilizacao) +
              opt('Comodato / Condomínio Familiar', d.utilizacao) +
              opt('Sede / Reserva Florestal / Lazer', d.utilizacao) +
              opt('Locação Urbana / Renda de Aluguel', d.utilizacao) +
              opt('Uso Residencial da Família', d.utilizacao) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Situação Documental (CAR / CCIR / Geo)</label>' +
            '<select data-f="situacao_doc">' +
              opt('100% Regular (Matrícula + CAR + CCIR + Geo)', d.situacao_doc) +
              opt('Regular, mas falta Georreferenciamento ou averbação', d.situacao_doc) +
              opt('Pendência de CAR / Reserva Legal / Retificação', d.situacao_doc) +
              opt('Sem matrícula individualizada (Posse / Fração ideal)', d.situacao_doc) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Possui Hipoteca, Alienação Fiduciária ou Penhora?</label>' +
            '<select data-f="onus_garantia">' +
              opt('Livre de ônus / Sem garantia bancária', d.onus_garantia) +
              opt('Sim — Hipoteca em Cédula Rural (exige anuência)', d.onus_garantia) +
              opt('Sim — Alienação Fiduciária ao Banco (exige anuência)', d.onus_garantia) +
              opt('Sim — Penhora / Arrolamento Fiscal', d.onus_garantia) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Interesse de venda nos próximos 12 meses?</label>' +
            '<select data-f="interesse_venda">' +
              opt('Não (manter no legado da família)', d.interesse_venda) +
              opt('Sim (pretende vender no curto prazo)', d.interesse_venda) +
              opt('Em dúvida / depende de proposta', d.interesse_venda) +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplEmpresa(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="empresas">' +
        '<div class="repeater-item-top">' +
          '<strong>Empresa / Participação Societária #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Razão Social / Nome da Empresa</label>' +
            '<input type="text" data-f="nome" value="' + esc(d.nome) + '" placeholder="Ex.: Agropecuária Santa Inês Ltda">' +
          '</div>' +
          '<div class="field">' +
            '<label>CNPJ (opcional)</label>' +
            '<input type="text" data-f="cnpj" inputmode="numeric" value="' + esc(d.cnpj) + '" placeholder="00.000.000/0001-00">' +
          '</div>' +
          '<div class="field">' +
            '<label>Atividade / Ramo e Regime Tributário</label>' +
            '<input type="text" data-f="ramo" value="' + esc(d.ramo) + '" placeholder="Ex.: Agropecuária — Lucro Presumido">' +
          '</div>' +
          '<div class="field">' +
            '<label>Quadro de Sócios e % da Família</label>' +
            '<input type="text" data-f="socios" value="' + esc(d.socios) + '" placeholder="Ex.: Patriarca 50% + Matriarca 50%">' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-3">' +
          '<div class="field">' +
            '<label>Possui imóveis já registrados neste CNPJ?</label>' +
            '<select data-f="imoveis_cnpj">' +
              opt('Não', d.imoveis_cnpj) +
              opt('Sim', d.imoveis_cnpj) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Estimado de Mercado da Participação (R$)</label>' +
            '<input type="text" data-f="valor_mercado" data-money inputmode="decimal" value="' + esc(d.valor_mercado) + '" placeholder="Ex.: 1.500.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Capital Social / Valor Declarado no IRPF (R$)</label>' +
            '<input type="text" data-f="valor_dirpf" data-money inputmode="decimal" value="' + esc(d.valor_dirpf) + '" placeholder="Ex.: 300.000">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplMovel(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="moveis">' +
        '<div class="repeater-item-top">' +
          '<strong>Maquinário / Veículo / Equipamento #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Categoria</label>' +
            '<select data-f="categoria">' +
              opt('Tratores, Colheitadeiras e Pulverizadores', d.categoria) +
              opt('Secadores, Pivôs, Silos e Implementos', d.categoria) +
              opt('Caminhões e Utilitários Rurais', d.categoria) +
              opt('Automóveis de Passeio / Aeronaves', d.categoria) +
              opt('Lote Consolidado da Frota Agrícola', d.categoria) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Descrição / Quantidade / Modelo</label>' +
            '<input type="text" data-f="descricao" value="' + esc(d.descricao) + '" placeholder="Ex.: 3 Tratores John Deere + Colheitadeira Café">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Estimado de Mercado (R$)</label>' +
            '<input type="text" data-f="valor_mercado" data-money inputmode="decimal" value="' + esc(d.valor_mercado) + '" placeholder="Ex.: 1.800.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Declarado no IRPF (R$)</label>' +
            '<input type="text" data-f="valor_dirpf" data-money inputmode="decimal" value="' + esc(d.valor_dirpf) + '" placeholder="Ex.: 900.000">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplSemovente(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="semoventes">' +
        '<div class="repeater-item-top">' +
          '<strong>Rebanho / Semoventes #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Espécie / Finalidade</label>' +
            '<select data-f="tipo">' +
              opt('Bovinos de Corte (Cria / Recria / Engorda)', d.tipo) +
              opt('Bovinos de Leite', d.tipo) +
              opt('Gado PO / Genética / Matrizes', d.tipo) +
              opt('Equinos / Muares', d.tipo) +
              opt('Outros Semoventes', d.tipo) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Quantidade Aproximada (Cabeças) e Fazenda</label>' +
            '<input type="text" data-f="quantidade" inputmode="numeric" value="' + esc(d.quantidade) + '" placeholder="Ex.: 650 cabeças Nelore na Faz. Cachoeira">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Total de Mercado (R$)</label>' +
            '<input type="text" data-f="valor_mercado" data-money inputmode="decimal" value="' + esc(d.valor_mercado) + '" placeholder="Ex.: 2.600.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Declarado no IRPF / Ficha Rebanho (R$)</label>' +
            '<input type="text" data-f="valor_dirpf" data-money inputmode="decimal" value="' + esc(d.valor_dirpf) + '" placeholder="Ex.: 1.100.000">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplFinanceiro(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="financeiros">' +
        '<div class="repeater-item-top">' +
          '<strong>Ativo Financeiro / Estoque de Safra #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Tipo de Ativo</label>' +
            '<select data-f="tipo">' +
              opt('Aplicações Financeiras (CDB, LCA, Fundos)', d.tipo) +
              opt('Safra Estocada (Café, Soja, Milho em Cooperativa/Armazém)', d.tipo) +
              opt('Capital Social / Cotas-Partes em Cooperativa', d.tipo) +
              opt('Previdência Privada (VGBL / PGBL)', d.tipo) +
              opt('Créditos a Receber / Contratos de Venda', d.tipo) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Instituição / Cooperativa / Descrição</label>' +
            '<input type="text" data-f="instituicao" value="' + esc(d.instituicao) + '" placeholder="Ex.: Cooxupé / Sicoob / Banco do Brasil">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Atual de Mercado (R$)</label>' +
            '<input type="text" data-f="valor_mercado" data-money inputmode="decimal" value="' + esc(d.valor_mercado) + '" placeholder="Ex.: 850.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Declarado no IRPF (R$)</label>' +
            '<input type="text" data-f="valor_dirpf" data-money inputmode="decimal" value="' + esc(d.valor_dirpf) + '" placeholder="Ex.: 850.000">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplDivida(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="dividas">' +
        '<div class="repeater-item-top">' +
          '<strong>Operação de Crédito Rural / Passivo #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Banco / Cooperativa / Credor</label>' +
            '<input type="text" data-f="credor" value="' + esc(d.credor) + '" placeholder="Ex.: Banco do Brasil / Sicoob / Cooperativa">' +
          '</div>' +
          '<div class="field">' +
            '<label>Modalidade da Operação</label>' +
            '<select data-f="modalidade">' +
              opt('Custeio Agrícola / Pecuário', d.modalidade) +
              opt('Investimento Rural (PRONAMP / BNDES / Moderfrota)', d.modalidade) +
              opt('CPR — Cédula de Produto Rural (Física ou Financeira)', d.modalidade) +
              opt('Financiamento para Aquisição de Terra', d.modalidade) +
              opt('Parcelamento Tributário / FUNRURAL / ITR', d.modalidade) +
              opt('Empréstimo Particular / Outra Dívida', d.modalidade) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Tipo de Garantia Vinculada</label>' +
            '<select data-f="garantia">' +
              opt('Hipoteca de Imóvel Rural (exige anuência p/ holding)', d.garantia) +
              opt('Alienação Fiduciária de Imóvel (exige anuência)', d.garantia) +
              opt('Alienação Fiduciária de Máquina / Veículo', d.garantia) +
              opt('Penhor de Safra ou Rebanho', d.garantia) +
              opt('Apenas Aval Pessoal / Sem garantia real imobiliária', d.garantia) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Qual imóvel ou bem está gravado na garantia?</label>' +
            '<input type="text" data-f="bem_vinculado" value="' + esc(d.bem_vinculado) + '" placeholder="Ex.: Matrícula 14.230 da Faz. Cachoeira">' +
          '</div>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Saldo Devedor Atual (R$)</label>' +
            '<input type="text" data-f="saldo_devedor" data-money inputmode="decimal" value="' + esc(d.saldo_devedor) + '" placeholder="Ex.: 1.450.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Declarado no IRPF (R$)</label>' +
            '<input type="text" data-f="valor_dirpf" data-money inputmode="decimal" value="' + esc(d.valor_dirpf) + '" placeholder="Ex.: 1.450.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Prazo de Quitação / Vencimento Final</label>' +
            '<input type="text" data-f="prazo" value="' + esc(d.prazo) + '" placeholder="Ex.: 48 meses (vence em 2030)">' +
          '</div>' +
          '<div class="field">' +
            '<label>Situação do Contrato</label>' +
            '<select data-f="situacao">' +
              opt('Em dia (adimplente)', d.situacao) +
              opt('Renegociado / Alongado em cumprimento', d.situacao) +
              opt('Em atraso / Em discussão', d.situacao) +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function tplProcesso(data, idx) {
    var d = data || {};
    return (
      '<div class="repeater-item" data-repeater="processos">' +
        '<div class="repeater-item-top">' +
          '<strong>Processo / Contingência #' + idx + '</strong>' +
          '<button type="button" class="btn-remove-item" data-remove-item>Remover</button>' +
        '</div>' +
        '<div class="field-grid-4">' +
          '<div class="field">' +
            '<label>Esfera e Natureza</label>' +
            '<select data-f="natureza">' +
              opt('Administrativo — Ambiental (IBAMA / IEF / SEMAD)', d.natureza) +
              opt('Administrativo — Fiscal (Receita Federal / SEFAZ / ITR)', d.natureza) +
              opt('Judicial — Trabalhista Rural', d.natureza) +
              opt('Judicial — Execução Fiscal', d.natureza) +
              opt('Judicial — Cível / Contratos / Divisa de Terras', d.natureza) +
              opt('Judicial — Sucessório / Família', d.natureza) +
            '</select>' +
          '</div>' +
          '<div class="field">' +
            '<label>Órgão / Comarca / Resumo do Caso</label>' +
            '<input type="text" data-f="resumo" value="' + esc(d.resumo) + '" placeholder="Ex.: Auto de infração ambiental em recurso">' +
          '</div>' +
          '<div class="field">' +
            '<label>Valor Estimado Envolvido (R$)</label>' +
            '<input type="text" data-f="valor" data-money inputmode="decimal" value="' + esc(d.valor) + '" placeholder="Ex.: 80.000">' +
          '</div>' +
          '<div class="field">' +
            '<label>Fase Atual / Existe Acordo?</label>' +
            '<input type="text" data-f="fase" value="' + esc(d.fase) + '" placeholder="Ex.: Defesa apresentada pelo advogado">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function opt(label, selectedVal) {
    var isSel = selectedVal && String(selectedVal) === String(label) ? ' selected' : '';
    return '<option value="' + esc(label) + '"' + isSel + '>' + esc(label) + '</option>';
  }

  // ==================== GERENCIAMENTO DOS REPEATERS ====================

  var repeaterConfigs = {
    herdeiros: { containerId: 'lista-herdeiros', tpl: tplHerdeiro },
    imoveis: { containerId: 'lista-imoveis', tpl: tplImovel },
    empresas: { containerId: 'lista-empresas', tpl: tplEmpresa },
    moveis: { containerId: 'lista-moveis', tpl: tplMovel },
    semoventes: { containerId: 'lista-semoventes', tpl: tplSemovente },
    financeiros: { containerId: 'lista-financeiros', tpl: tplFinanceiro },
    dividas: { containerId: 'lista-dividas', tpl: tplDivida },
    processos: { containerId: 'lista-processos', tpl: tplProcesso }
  };

  function addRepeaterItem(type, data) {
    var cfg = repeaterConfigs[type];
    if (!cfg) return;
    var container = document.getElementById(cfg.containerId);
    if (!container) return;
    var idx = container.children.length + 1;
    var wrapper = document.createElement('div');
    wrapper.innerHTML = cfg.tpl(data || {}, idx);
    var el = wrapper.firstElementChild;
    container.appendChild(el);
    renumberRepeater(type);
    onFormChanged();
  }

  function renumberRepeater(type) {
    var cfg = repeaterConfigs[type];
    if (!cfg) return;
    var container = document.getElementById(cfg.containerId);
    if (!container) return;
    var items = container.querySelectorAll('.repeater-item');
    items.forEach(function (item, i) {
      var strong = item.querySelector('.repeater-item-top strong');
      if (strong) {
        strong.textContent = strong.textContent.replace(/#\d+/, '#' + (i + 1));
      }
    });
  }

  // ==================== EXTRAÇÃO E POPULAÇÃO DO ESTADO ====================

  function collectRepeater(type) {
    var cfg = repeaterConfigs[type];
    var container = document.getElementById(cfg.containerId);
    if (!container) return [];
    var rows = [];
    container.querySelectorAll('.repeater-item').forEach(function (item) {
      var obj = {};
      var hasAny = false;
      item.querySelectorAll('[data-f]').forEach(function (inp) {
        var key = inp.getAttribute('data-f');
        var val = (inp.value || '').trim();
        obj[key] = val;
        if (val && inp.tagName === 'INPUT') hasAny = true;
      });
      if (hasAny || rows.length === 0) {
        rows.push(obj);
      }
    });
    return rows;
  }

  function collectChecked(name) {
    var arr = [];
    document.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (cb) {
      arr.push(cb.value);
    });
    return arr;
  }

  function collectAllData() {
    var form = document.getElementById('diag-form');
    var fields = {};
    if (form) {
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (el) {
        if (el.type === 'checkbox') return;
        fields[el.name] = (el.value || '').trim();
      });
    }

    return {
      versao: 'raizes-evpf-1.0',
      atualizado_em: new Date().toISOString(),
      fields: fields,
      atividades: collectChecked('atividades'),
      objetivos: collectChecked('objetivos'),
      docs_disp: collectChecked('docs_disp'),
      herdeiros: collectRepeater('herdeiros'),
      imoveis: collectRepeater('imoveis'),
      empresas: collectRepeater('empresas'),
      moveis: collectRepeater('moveis'),
      semoventes: collectRepeater('semoventes'),
      financeiros: collectRepeater('financeiros'),
      dividas: collectRepeater('dividas'),
      processos: collectRepeater('processos')
    };
  }

  function populateAllData(state) {
    if (!state || typeof state !== 'object') return;
    var fields = state.fields || {};
    var form = document.getElementById('diag-form');
    if (form) {
      Object.keys(fields).forEach(function (k) {
        var el = form.querySelector('[name="' + k + '"]');
        if (el && el.type !== 'checkbox') {
          el.value = fields[k];
        }
      });
    }

    // Atualizar botões de nota 0-10
    syncNotaButtons(fields.legado_nota || '');

    // Checkboxes
    ['atividades', 'objetivos', 'docs_disp'].forEach(function (groupName) {
      var list = state[groupName] || [];
      document.querySelectorAll('input[name="' + groupName + '"]').forEach(function (cb) {
        cb.checked = list.indexOf(cb.value) > -1;
      });
    });

    // Repeaters
    Object.keys(repeaterConfigs).forEach(function (type) {
      var container = document.getElementById(repeaterConfigs[type].containerId);
      if (!container) return;
      container.innerHTML = '';
      var arr = state[type] || [];
      arr.forEach(function (itemData, i) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = repeaterConfigs[type].tpl(itemData, i + 1);
        container.appendChild(wrapper.firstElementChild);
      });
    });

    ensureMinimumRows();
    updateKPIsAndDossie();
  }

  function ensureMinimumRows() {
    if (document.getElementById('lista-herdeiros').children.length === 0) {
      addRepeaterItem('herdeiros', {});
    }
    if (document.getElementById('lista-imoveis').children.length === 0) {
      addRepeaterItem('imoveis', {});
    }
    if (document.getElementById('lista-moveis').children.length === 0) {
      addRepeaterItem('moveis', {});
    }
    if (document.getElementById('lista-semoventes').children.length === 0) {
      addRepeaterItem('semoventes', {});
    }
    if (document.getElementById('lista-dividas').children.length === 0) {
      addRepeaterItem('dividas', {});
    }
  }

  // ==================== CÁLCULOS PATRIMONIAIS E KPIS ====================

  function computeTotals(state) {
    var imoveisMerc = 0, imoveisDirpf = 0, imoveisItr = 0, areaHa = 0, countImoveis = 0, countImoveisComOnus = 0;
    (state.imoveis || []).forEach(function (im) {
      if (im.nome || parseBRL(im.valor_mercado) > 0 || parseBRL(im.valor_dirpf) > 0) {
        countImoveis++;
        imoveisMerc += parseBRL(im.valor_mercado);
        imoveisDirpf += parseBRL(im.valor_dirpf);
        imoveisItr += parseBRL(im.valor_itr);
        var a = parseBRL(im.area);
        if (im.unidade_area && im.unidade_area.indexOf('alqueire') > -1) {
          areaHa += a * 4.84;
        } else if (im.unidade_area && im.unidade_area.indexOf('ha') > -1) {
          areaHa += a;
        }
        if (im.onus_garantia && im.onus_garantia.indexOf('Sim') === 0) {
          countImoveisComOnus++;
        }
      }
    });

    var empMerc = 0, empDirpf = 0;
    (state.empresas || []).forEach(function (e) {
      empMerc += parseBRL(e.valor_mercado);
      empDirpf += parseBRL(e.valor_dirpf);
    });

    var movMerc = 0, movDirpf = 0;
    (state.moveis || []).forEach(function (m) {
      movMerc += parseBRL(m.valor_mercado);
      movDirpf += parseBRL(m.valor_dirpf);
    });

    var semMerc = 0, semDirpf = 0;
    (state.semoventes || []).forEach(function (s) {
      semMerc += parseBRL(s.valor_mercado);
      semDirpf += parseBRL(s.valor_dirpf);
    });

    var finMerc = 0, finDirpf = 0;
    (state.financeiros || []).forEach(function (f) {
      finMerc += parseBRL(f.valor_mercado);
      finDirpf += parseBRL(f.valor_dirpf);
    });

    var divSaldo = 0, divDirpf = 0;
    (state.dividas || []).forEach(function (d) {
      divSaldo += parseBRL(d.saldo_devedor);
      divDirpf += parseBRL(d.valor_dirpf);
    });

    var procValor = 0;
    (state.processos || []).forEach(function (p) {
      procValor += parseBRL(p.valor);
    });

    var totalMerc = imoveisMerc + empMerc + movMerc + semMerc + finMerc;
    var totalDirpf = imoveisDirpf + empDirpf + movDirpf + semDirpf + finDirpf;
    var totalPassivos = divSaldo + procValor;
    var patrimonioLiquidoMerc = Math.max(0, totalMerc - divSaldo);

    var countHerdeiros = 0;
    (state.herdeiros || []).forEach(function (h) {
      if (h.nome) countHerdeiros++;
    });

    return {
      countHerdeiros: countHerdeiros,
      countImoveis: countImoveis,
      countImoveisComOnus: countImoveisComOnus,
      areaHa: Math.round(areaHa),
      imoveisMerc: imoveisMerc,
      imoveisDirpf: imoveisDirpf,
      imoveisItr: imoveisItr,
      empMerc: empMerc,
      empDirpf: empDirpf,
      movMerc: movMerc,
      movDirpf: movDirpf,
      semMerc: semMerc,
      semDirpf: semDirpf,
      finMerc: finMerc,
      finDirpf: finDirpf,
      totalMerc: totalMerc,
      totalDirpf: totalDirpf,
      divSaldo: divSaldo,
      procValor: procValor,
      totalPassivos: totalPassivos,
      patrimonioLiquidoMerc: patrimonioLiquidoMerc
    };
  }

  function updateAlqueireHints() {
    var container = document.getElementById('lista-imoveis');
    if (!container) return;
    container.querySelectorAll('.repeater-item').forEach(function (item) {
      var areaInp = item.querySelector('[data-f="area"]');
      var unitSel = item.querySelector('[data-f="unidade_area"]');
      var hintEl = item.querySelector('[data-area-hint]');
      if (!hintEl || !areaInp) return;

      var val = parseBRL(areaInp.value);
      var unit = unitSel ? (unitSel.value || '') : '';
      if (val > 0) {
        if (unit.indexOf('alqueire') > -1) {
          var haMineiro = val * 4.84;
          var haPaulista = val * 2.42;
          hintEl.textContent = '≈ ' + haMineiro.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha (Alq. Mineiro/GO) ou ' + haPaulista.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha (SP)';
          hintEl.style.display = 'block';
        } else if (unit.indexOf('ha') > -1) {
          var alqMin = val / 4.84;
          hintEl.textContent = '≈ ' + alqMin.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' alqueires mineiros (ou ' + (val * 10000).toLocaleString('pt-BR') + ' m²)';
          hintEl.style.display = 'block';
        } else {
          hintEl.textContent = '';
          hintEl.style.display = 'none';
        }
      } else {
        hintEl.textContent = '';
        hintEl.style.display = 'none';
      }
    });
  }

  function updateKPIsAndDossie() {
    var state = collectAllData();
    var t = computeTotals(state);
    var f = state.fields || {};

    var famLabel = f.fam_nome_referencia || f.tit1_nome || 'Não informado';
    if (t.countHerdeiros > 0) {
      famLabel += ' (' + t.countHerdeiros + ' fam.)';
    }
    setText('kpi-familia', famLabel);
    setText('kpi-imoveis', t.countImoveis + ' imóveis (' + t.areaHa.toLocaleString('pt-BR') + ' ha)');
    setText('kpi-mercado', formatBRL(t.totalMerc));
    setText('kpi-dirpf', formatBRL(t.totalDirpf));
    setText('kpi-passivos', formatBRL(t.totalPassivos));
    setText('kpi-legado', (f.legado_nota !== '' && f.legado_nota !== undefined ? f.legado_nota : '—') + ' / 10');

    updateAlqueireHints();
    renderDossieHTML(state, t);
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  // ==================== RENDERIZAÇÃO DO DOSSIÊ CONSOLIDADO (ETAPA 6) ====================

  function renderDossieHTML(state, t) {
    var box = document.getElementById('dossie-render');
    if (!box) return;
    var f = state.fields || {};
    var dataHoje = new Date().toLocaleDateString('pt-BR');

    // Apontamentos técnicos automáticos baseados na Planilha OURO e Metodologia Raízes
    var apontamentos = [];
    if (t.imoveisMerc > 0 && t.imoveisDirpf > 0 && t.imoveisMerc > t.imoveisDirpf * 1.5) {
      var defasagem = t.imoveisMerc - t.imoveisDirpf;
      apontamentos.push(
        '<li><strong>Defasagem relevante entre Valor de Mercado e Valor Declarado no IRPF (' + formatBRL(defasagem) + '):</strong> ' +
        'Em eventual inventário tradicional, a base de cálculo do ITCMD e dos custos incide sobre o valor atualizado de mercado (' + formatBRL(t.totalMerc) + '), enquanto na estruturação preventiva em vida analisa-se a integralização pelo valor constante na DIRPF (art. 23 da Lei 9.249/95) e o planejamento das quotas sociais.</li>'
      );
    }
    if (t.countImoveisComOnus > 0 || t.divSaldo > 0) {
      apontamentos.push(
        '<li><strong>Atenção a Garantias Bancárias / Crédito Rural (' + formatBRL(t.divSaldo) + '):</strong> ' +
        'Imóveis gravados com hipoteca ou alienação fiduciária em cédulas de crédito rural exigem <strong>Termo de Anuência prévia da instituição financeira</strong> antes de qualquer conferência de bens ao capital social da holding, preservando o crédito rural do produtor.</li>'
      );
    }
    if (f.legado_6 === 'sim') {
      apontamentos.push(
        '<li><strong>Existência de contratos verbais de exploração rural:</strong> ' +
        'Recomendada a formalização escrita dos contratos de arrendamento, parceria ou comodato (Estatuto da Terra — Lei 4.504/64) para evitar descaracterização fiscal pela Receita Federal.</li>'
      );
    }
    if (f.suc_filhos_fora_casamento && f.suc_filhos_fora_casamento.indexOf('Sim') === 0) {
      apontamentos.push(
        '<li><strong>Núcleo familiar com filhos de vínculos distintos:</strong> ' +
        'Exige atenção redobrada à meação, legítima e eventuais cláusulas de incomunicabilidade, impenhorabilidade, inalienabilidade e reversão no planejamento sucessório.</li>'
      );
    }
    if (apontamentos.length === 0) {
      apontamentos.push(
        '<li>Preencha os dados das etapas anteriores para visualizar os apontamentos preliminares de viabilidade patrimonial e sucessória.</li>'
      );
    }

    var herdeirosRows = '';
    (state.herdeiros || []).forEach(function (h, i) {
      if (!h.nome && !h.vinculo) return;
      herdeirosRows +=
        '<tr>' +
          '<td>' + (i + 1) + '. ' + esc(h.nome || '—') + '</td>' +
          '<td>' + esc(h.vinculo || '—') + ' (' + esc(h.idade || '—') + ')</td>' +
          '<td>' + esc(h.estado_civil || '—') + ' · ' + esc(h.regime_bens || '—') + '</td>' +
          '<td>' + esc(h.atua_agro || '—') + '</td>' +
          '<td>' + esc(h.sucessor || '—') + '</td>' +
        '</tr>';
    });
    if (!herdeirosRows) {
      herdeirosRows = '<tr><td colspan="5">Nenhum herdeiro/familiar detalhado até o momento.</td></tr>';
    }

    var imoveisRows = '';
    (state.imoveis || []).forEach(function (im, i) {
      if (!im.nome && !im.valor_mercado && !im.valor_dirpf) return;
      imoveisRows +=
        '<tr>' +
          '<td><strong>' + (i + 1) + '. ' + esc(im.nome || 'Imóvel #' + (i + 1)) + '</strong><br><small>' + esc(im.natureza || 'Rural') + ' · ' + esc(im.municipio_uf || '—') + ' · ' + esc(im.matricula || '') + '</small></td>' +
          '<td>' + esc(im.area || '0') + ' ' + esc(im.unidade_area || 'ha') + '<br><small>' + esc(im.utilizacao || '') + '</small></td>' +
          '<td>' + esc(im.titularidade || '—') + '<br><small>' + esc(im.onus_garantia || '') + '</small></td>' +
          '<td>' + formatBRL(parseBRL(im.valor_mercado)) + '</td>' +
          '<td>' + formatBRL(parseBRL(im.valor_dirpf)) + '</td>' +
          '<td>' + formatBRL(parseBRL(im.valor_itr)) + '</td>' +
        '</tr>';
    });
    if (!imoveisRows) {
      imoveisRows = '<tr><td colspan="6">Nenhum imóvel cadastrado até o momento.</td></tr>';
    }

    var html =
      '<div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; border-bottom:2px solid var(--verde-800); padding-bottom:16px; margin-bottom:22px;">' +
        '<div>' +
          '<div style="font-size:.76rem; text-transform:uppercase; letter-spacing:.12em; color:var(--terra-600); font-weight:700;">Raízes Proteção Patrimonial Rural · Estudo de Viabilidade (EVPF)</div>' +
          '<h3 style="font-size:1.55rem; color:var(--verde-900); margin:4px 0;">Dossiê de Diagnóstico Patrimonial e Familiar</h3>' +
          '<div style="font-size:.92rem; color:var(--tinta-2);">Caso / Família: <strong>' + esc(f.fam_nome_referencia || f.tit1_nome || 'Não identificado') + '</strong> · Emitido em ' + dataHoje + '</div>' +
        '</div>' +
        '<div style="text-align:right; font-size:.86rem; color:var(--tinta-3);">' +
          '<div><strong>Contato:</strong> ' + esc(f.fam_whatsapp || '—') + '</div>' +
          '<div><strong>E-mail:</strong> ' + esc(f.fam_email || '—') + '</div>' +
          '<div><strong>Origem / Residência:</strong> ' + esc(f.fam_cidade_residencia || f.fam_cidade_origem || '—') + ' (' + esc(f.fam_uf_principal || 'MG') + ')</div>' +
        '</div>' +
      '</div>' +

      '<h4 style="color:var(--verde-900); margin-bottom:8px;">1. Síntese Financeira e Patrimonial Consolidada (Planilha OURO — Aba 5)</h4>' +
      '<table class="dossie-table">' +
        '<thead>' +
          '<tr>' +
            '<th>Classe Patrimonial</th>' +
            '<th>Valor Estimado de Mercado</th>' +
            '<th>Valor Declarado no IRPF</th>' +
            '<th>Diferença (Mercado × IRPF)</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<td>Bens Imóveis (' + t.countImoveis + ' imóveis · ' + t.areaHa.toLocaleString('pt-BR') + ' ha)</td>' +
            '<td><strong>' + formatBRL(t.imoveisMerc) + '</strong></td>' +
            '<td>' + formatBRL(t.imoveisDirpf) + '</td>' +
            '<td>' + formatBRL(Math.max(0, t.imoveisMerc - t.imoveisDirpf)) + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>Empresas / Participações Societárias</td>' +
            '<td>' + formatBRL(t.empMerc) + '</td>' +
            '<td>' + formatBRL(t.empDirpf) + '</td>' +
            '<td>' + formatBRL(Math.max(0, t.empMerc - t.empDirpf)) + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>Maquinários, Implementos e Veículos (Bens Móveis)</td>' +
            '<td>' + formatBRL(t.movMerc) + '</td>' +
            '<td>' + formatBRL(t.movDirpf) + '</td>' +
            '<td>' + formatBRL(Math.max(0, t.movMerc - t.movDirpf)) + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>Rebanho / Bens Semoventes</td>' +
            '<td>' + formatBRL(t.semMerc) + '</td>' +
            '<td>' + formatBRL(t.semDirpf) + '</td>' +
            '<td>' + formatBRL(Math.max(0, t.semMerc - t.semDirpf)) + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>Aplicações Financeiras, Safra Estocada e Cooperativas</td>' +
            '<td>' + formatBRL(t.finMerc) + '</td>' +
            '<td>' + formatBRL(t.finDirpf) + '</td>' +
            '<td>' + formatBRL(Math.max(0, t.finMerc - t.finDirpf)) + '</td>' +
          '</tr>' +
          '<tr style="background:var(--verde-50); font-weight:700;">' +
            '<td>PATRIMÔNIO BRUTO TOTAL</td>' +
            '<td>' + formatBRL(t.totalMerc) + '</td>' +
            '<td>' + formatBRL(t.totalDirpf) + '</td>' +
            '<td>' + formatBRL(Math.max(0, t.totalMerc - t.totalDirpf)) + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>(–) Passivos Bancários / Crédito Rural + Contingências</td>' +
            '<td style="color:var(--erro);">' + formatBRL(t.totalPassivos) + '</td>' +
            '<td>' + formatBRL(t.divDirpf) + '</td>' +
            '<td>Patrimônio Líquido (Mercado): <strong>' + formatBRL(t.patrimonioLiquidoMerc) + '</strong></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +

      '<h4 style="color:var(--verde-900); margin-bottom:8px;">2. Estrutura Familiar e Sucessória</h4>' +
      '<p style="font-size:.92rem; margin-bottom:10px;">' +
        '<strong>Titular 1:</strong> ' + esc(f.tit1_nome || '—') + ' (' + esc(f.tit1_nascimento || '—') + ') · ' +
        '<strong>Estado Civil / Regime:</strong> ' + esc(f.tit1_estado_civil || '—') + ' — ' + esc(f.tit1_regime_bens || '—') + ' (' + esc(f.tit1_data_casamento || '—') + ') · ' +
        '<strong>Pacto:</strong> ' + esc(f.tit1_pacto_antenupcial || '—') + '<br>' +
        '<strong>Titular 2 / Cônjuge:</strong> ' + esc(f.tit2_nome || 'Não informado') + ' (' + esc(f.tit2_atuacao || '—') + ') · ' +
        '<strong>Filhos fora do casamento:</strong> ' + esc(f.suc_filhos_fora_casamento || '—') + ' · ' +
        '<strong>Instrumentos existentes:</strong> ' + esc(f.suc_instrumentos_existentes || 'Nenhum') +
      '</p>' +
      (f.fam_historia_legado ? '<p style="font-size:.9rem; background:var(--areia-clara); padding:10px 14px; border-radius:6px; margin-bottom:12px;"><strong>Contexto / História da Família:</strong> ' + esc(f.fam_historia_legado) + '</p>' : '') +

      '<table class="dossie-table">' +
        '<thead><tr><th>Familiar / Herdeiro</th><th>Vínculo e Idade</th><th>Estado Civil / Regime</th><th>Atua no Agro?</th><th>Sucessor?</th></tr></thead>' +
        '<tbody>' + herdeirosRows + '</tbody>' +
      '</table>' +

      '<h4 style="color:var(--verde-900); margin-bottom:8px;">3. Relação de Imóveis Rurais e Urbanos</h4>' +
      '<table class="dossie-table">' +
        '<thead><tr><th>Imóvel / Município / Matrícula</th><th>Área e Uso</th><th>Titularidade e Ônus</th><th>Valor Mercado</th><th>Valor IRPF</th><th>VTN / ITR</th></tr></thead>' +
        '<tbody>' + imoveisRows + '</tbody>' +
      '</table>' +

      '<h4 style="color:var(--verde-900); margin-bottom:8px;">4. Gestão, Tributação, Legado e Governança</h4>' +
      '<table class="dossie-table">' +
        '<tbody>' +
          '<tr>' +
            '<th style="width:28%;">Atividades Exercidas</th>' +
            '<td>' + esc((state.atividades || []).join(', ') || 'Não informado') + '</td>' +
            '<th style="width:22%;">Tributação Atual</th>' +
            '<td>' + esc(f.trib_regime_atual || '—') + ' (Receita: ' + esc(f.trib_receita_anual || '—') + ')</td>' +
          '</tr>' +
          '<tr>' +
            '<th>Administrador Atual → Futuro</th>' +
            '<td>' + esc(f.gest_admin_atual || '—') + ' → ' + esc(f.gest_admin_futuro || '—') + '</td>' +
            '<th>Nota de Organização do Legado</th>' +
            '<td><strong>' + esc(f.legado_nota !== '' ? f.legado_nota + ' / 10' : 'Não atribuída') + '</strong></td>' +
          '</tr>' +
          '<tr>' +
            '<th>Governança e Sucessão</th>' +
            '<td>Comunicação: ' + esc(f.gov_g5 || '—') + ' · Reuniões: ' + esc(f.gov_g7 || '—') + ' · Plano Sucessório: ' + esc(f.gov_g12 || '—') + '</td>' +
            '<th>Documentos já disponíveis</th>' +
            '<td>' + (state.docs_disp ? state.docs_disp.length : 0) + ' de 12 itens marcados</td>' +
          '</tr>' +
          '<tr>' +
            '<th>Objetivos Prioritários</th>' +
            '<td colspan="3">' + esc((state.objetivos || []).join(' · ') || 'Não selecionado') + '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +

      '<div style="background:var(--verde-50); border-left:4px solid var(--verde-800); padding:16px 20px; border-radius:6px; margin-top:16px;">' +
        '<strong style="color:var(--verde-900); display:block; margin-bottom:6px;">Apontamentos Técnicos Preliminares para a Reunião de Viabilidade:</strong>' +
        '<ul style="margin:0; padding-left:18px; font-size:.9rem; line-height:1.55; color:var(--tinta-2);">' +
          apontamentos.join('') +
        '</ul>' +
      '</div>' +
      '<p style="font-size:.78rem; color:var(--tinta-3); margin-top:16px; margin-bottom:0;">' +
        'Nota Legal e Metodológica: Levantamento preliminar confidencial elaborado pelo titular para fins de Estudo de Viabilidade Patrimonial e Familiar (EVPF). Valores e enquadramentos tributários dependem da conferência das matrículas, declarações de IRPF/ITR, contratos e legislação estadual vigente na data da execução.' +
      '</p>';

    box.innerHTML = html;
  }

  // ==================== TEXTO PARA WHATSAPP E CLIPBOARD ====================

  function buildPlainTextSummary(state, t) {
    var f = state.fields || {};
    var lines = [];
    lines.push('🌳 *DIAGNÓSTICO PATRIMONIAL E FAMILIAR — RAÍZES*');
    lines.push('Caso/Família: *' + (f.fam_nome_referencia || f.tit1_nome || 'Não informado') + '*');
    lines.push('Contato: ' + (f.fam_whatsapp || '—') + (f.fam_email ? ' | ' + f.fam_email : ''));
    lines.push('Cidade/UF: ' + (f.fam_cidade_residencia || f.fam_cidade_origem || '—') + ' (' + (f.fam_uf_principal || 'MG') + ')');
    lines.push('');
    lines.push('👨‍👩‍👧‍👦 *1. FAMÍLIA E SUCESSÃO*');
    lines.push('• Titular 1: ' + (f.tit1_nome || '—') + ' (' + (f.tit1_estado_civil || '') + ' - ' + (f.tit1_regime_bens || '') + ')');
    if (f.tit2_nome) lines.push('• Titular 2 / Cônjuge: ' + f.tit2_nome + ' (' + (f.tit2_atuacao || '') + ')');
    lines.push('• Herdeiros/Familiares cadastrados: ' + t.countHerdeiros);
    (state.herdeiros || []).forEach(function (h, i) {
      if (h.nome) {
        lines.push('   ' + (i + 1) + ') ' + h.nome + ' - ' + (h.vinculo || '') + ' | ' + (h.atua_agro || '') + ' | Sucessor: ' + (h.sucessor || ''));
      }
    });
    lines.push('');
    lines.push('🏞️ *2. SÍNTESE PATRIMONIAL*');
    lines.push('• Imóveis: ' + t.countImoveis + ' (' + t.areaHa + ' ha) | Mercado: ' + formatBRL(t.imoveisMerc) + ' | IRPF: ' + formatBRL(t.imoveisDirpf));
    if (t.empMerc > 0 || t.empDirpf > 0) lines.push('• Empresas/Quotas: Mercado ' + formatBRL(t.empMerc) + ' | IRPF ' + formatBRL(t.empDirpf));
    if (t.movMerc > 0) lines.push('• Máquinas/Veículos: Mercado ' + formatBRL(t.movMerc) + ' | IRPF ' + formatBRL(t.movDirpf));
    if (t.semMerc > 0) lines.push('• Rebanho/Semoventes: Mercado ' + formatBRL(t.semMerc) + ' | IRPF ' + formatBRL(t.semDirpf));
    if (t.finMerc > 0) lines.push('• Financeiro/Safra: Mercado ' + formatBRL(t.finMerc));
    lines.push('• *PATRIMÔNIO BRUTO (MERCADO):* ' + formatBRL(t.totalMerc));
    lines.push('• *DECLARADO NO IRPF:* ' + formatBRL(t.totalDirpf));
    lines.push('• *PASSIVOS / CRÉDITO RURAL:* ' + formatBRL(t.totalPassivos) + (t.countImoveisComOnus > 0 ? ' (' + t.countImoveisComOnus + ' imóvel(is) com ônus/garantia)' : ''));
    lines.push('• *PATRIMÔNIO LÍQUIDO ESTIMADO:* ' + formatBRL(t.patrimonioLiquidoMerc));
    lines.push('');
    lines.push('⚙️ *3. GESTÃO, LEGADO E OBJETIVOS*');
    if (state.atividades && state.atividades.length) lines.push('• Atividades: ' + state.atividades.join(', '));
    lines.push('• Tributação atual: ' + (f.trib_regime_atual || '—') + (f.trib_receita_anual ? ' | Receita: ' + f.trib_receita_anual : ''));
    lines.push('• Sucessor / Admin futuro: ' + (f.gest_admin_futuro || '—'));
    lines.push('• Nota de Organização do Legado: ' + (f.legado_nota !== '' ? f.legado_nota + '/10' : '—'));
    if (state.objetivos && state.objetivos.length) lines.push('• Objetivos: ' + state.objetivos.join('; '));
    lines.push('');
    lines.push('Gostaria de agendar a análise deste Diagnóstico Patrimonial com a equipe da Raízes.');
    return lines.join('\n');
  }

  // ==================== SALVAMENTO AUTOMÁTICO E NAVEGAÇÃO ====================

  var saveTimer = null;
  function onFormChanged() {
    updateKPIsAndDossie();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        var state = collectAllData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        var badge = document.getElementById('autosave-status');
        if (badge) {
          var hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          badge.innerHTML = '<span class="diag-save-dot"></span><span>Salvo automaticamente neste navegador às ' + hora + '</span>';
        }
      } catch (e) {
        // Ignorar quota exceeded
      }
    }, 250);
  }

  function switchStep(stepNum) {
    var n = String(stepNum);
    document.querySelectorAll('.diag-step-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-step-target') === n;
      btn.classList.toggle('active', active);
    });
    document.querySelectorAll('.diag-panel').forEach(function (panel) {
      var active = panel.getAttribute('data-step') === n;
      panel.classList.toggle('active', active);
    });
    updateKPIsAndDossie();
    var navEl = document.querySelector('.diag-steps-nav');
    if (navEl) {
      var rect = navEl.getBoundingClientRect();
      if (rect.top < 0 || rect.top > 300) {
        window.scrollTo({ top: Math.max(0, navEl.offsetTop - 150), behavior: 'smooth' });
      }
    }
  }

  function syncNotaButtons(val) {
    var hidden = document.getElementById('legado_nota');
    if (hidden) hidden.value = val;
    document.querySelectorAll('#legado-nota-buttons .nota-btn').forEach(function (btn) {
      btn.classList.toggle('selected', String(btn.getAttribute('data-nota')) === String(val) && val !== '');
    });
  }

  function showFeedback(msg, isError) {
    var box = document.getElementById('diag-action-feedback');
    if (!box) return;
    box.className = 'form-feedback ' + (isError ? 'err' : 'ok');
    box.textContent = msg;
  }

  // ==================== CASO DE EXEMPLO DEMONSTRATIVO ====================

  function getExampleCase() {
    return {
      versao: 'raizes-evpf-1.0',
      fields: {
        fam_nome_referencia: 'Família Ribeiro — Fazendas Cachoeira & Santa Clara',
        fam_whatsapp: '(32) 99988-7766',
        fam_email: 'antonio.ribeiro@exemplo.agr.br',
        fam_cidade_origem: 'Caratinga / Zona da Mata - MG',
        fam_cidade_residencia: 'Uberlândia / MG',
        fam_uf_principal: 'MG',
        fam_historia_legado: 'Patrimônio iniciado há 38 anos na cafeicultura e pecuária de corte. O casal fundador deseja organizar a sucessão em vida para os 3 filhos, evitando o custo de inventário e protegendo as terras contra eventuais divórcios ou riscos operacionais.',
        tit1_nome: 'Antônio Carlos Ribeiro',
        tit1_nascimento: '14/05/1958 (68 anos)',
        tit1_cpf: '',
        tit1_profissao: 'Produtor Rural (Cafeicultor e Pecuarista)',
        tit1_estado_civil: 'Casado(a)',
        tit1_regime_bens: 'Comunhão Parcial de Bens',
        tit1_data_casamento: '1986',
        tit1_pacto_antenupcial: 'Não',
        tit2_nome: 'Helena Maria de Souza Ribeiro',
        tit2_nascimento: '22/09/1961 (65 anos)',
        tit2_cpf: '',
        tit2_atuacao: 'Co-titular / atua na gestão',
        suc_filhos_fora_casamento: 'Não (todos os filhos são comuns ao casal)',
        suc_adiantamento_legitima: 'Sim, informalmente (ajuda financeira/compra de bem)',
        suc_instrumentos_existentes: 'Nenhum',
        suc_herdeiro_vulneravel: 'Nenhum',
        suc_conflitos_observacoes: 'Desejam cláusulas de incomunicabilidade, impenhorabilidade e usufruto vitalício com administração exclusiva dos pais.',
        imov_obs_regularizacao: 'Matrícula da Fazenda Santa Clara aguarda averbação do georreferenciamento já certificado no INCRA.',
        imov_obs_contratos: 'Fazenda Cachoeira explorada diretamente na PF (café e gado); Gleba Cerrado arrendada em sacas de soja.',
        pas_avais_terceiros: 'Não',
        pas_observacoes: 'Cédula rural de investimento no Banco do Brasil com hipoteca de 1º grau sobre a Matrícula 8.410.',
        trib_regime_atual: 'Pessoa Física — Livro Caixa (alíquota até 27,5%)',
        trib_receita_anual: 'R$ 3.800.000,00',
        trib_funrural: 'Sobre a comercialização da produção (1,5%)',
        gest_admin_atual: 'Antônio Carlos (Patriarca) e Lucas (Filho)',
        gest_admin_futuro: 'Lucas Ribeiro (Agrônomo / Produtor Rural)',
        gest_contador: 'Contabilidade Rural Minas',
        legado_1: 'nao',
        legado_1a: 'nao',
        legado_1b: 'sim',
        legado_2a: 'sim',
        legado_2a_i: 'nao',
        legado_2b: 'nao',
        legado_2c: 'nao',
        legado_2d: 'nao',
        legado_2e: 'nao',
        legado_3: 'sim',
        legado_4: 'sim',
        legado_4a: 'sim',
        legado_4b: 'sim',
        legado_4c: 'sim',
        legado_4d: 'nao',
        legado_5: 'sim',
        legado_6: 'sim',
        legado_nota: '6',
        gov_g5: 'Boa',
        gov_g7: 'Sim, ocasionalmente',
        gov_g8: 'Não (caixa único misturado)',
        gov_g9: 'Eficiente',
        gov_g10: 'Sim, mas pouco discutido',
        gov_g12: 'Somente ideia',
        gov_g14: 'Sim',
        gov_g6: 'Definir a compensação justa do filho que trabalha diariamente na fazenda em relação às duas irmãs que atuam fora do agronegócio.',
        gov_g18: 'Estruturar a holding patrimonial das terras separada da operação agrícola e firmar protocolo familiar claro.'
      },
      atividades: ['Cafeicultura', 'Soja / Milho / Grãos', 'Pecuária de Corte', 'Arrendamento Rural'],
      objetivos: [
        'Planejamento Sucessório em Vida (evitar inventário)',
        'Constituição de Holding Rural / Familiar',
        'Proteção Patrimonial Lícita contra Riscos Operacionais',
        'Redução Lícita de Carga Tributária (IRPF / ITCMD / Ganho de Capital)',
        'Protocolo Familiar e Regras para Herdeiros/Cônjuges'
      ],
      docs_disp: [
        'IRPF do patriarca e da matriarca',
        'Certidões de casamento / nascimento e pacto antenupcial',
        'Matrículas atualizadas dos imóveis (CRI)',
        'DITR (Declaração de ITR) + DIAT/DIAC e Carnê ITR/IPTU',
        'CCIR (INCRA) e CAR (Cadastro Ambiental Rural)',
        'Cédulas de crédito rural / extratos de financiamentos'
      ],
      herdeiros: [
        {
          nome: 'Lucas Souza Ribeiro',
          vinculo: 'Filho(a) comum do casal',
          idade: '38 anos',
          profissao: 'Agrônomo / Produtor Rural',
          estado_civil: 'Casado(a)',
          regime_bens: 'Comunhão Parcial de Bens',
          conjuge_filhos: 'Casado c/ Camila, 2 filhos',
          atua_agro: 'Sim, dedicação integral',
          sucessor: 'Sim, principal sucessor operacional',
          adiantamento: 'Não',
          obs: 'Responsável técnico e operacional das lavouras'
        },
        {
          nome: 'Mariana Ribeiro Mendes',
          vinculo: 'Filho(a) comum do casal',
          idade: '35 anos',
          profissao: 'Médica',
          estado_civil: 'Casado(a)',
          regime_bens: 'Separação Total de Bens',
          conjuge_filhos: 'Casada c/ Rafael, 1 filha',
          atua_agro: 'Não, atua em outra área / mora fora',
          sucessor: 'Não (apenas sócio/herdeiro patrimonial)',
          adiantamento: 'Sim (imóvel, quotas ou valor financeiro)',
          obs: 'Recebeu apartamento em Belo Horizonte em 2019'
        },
        {
          nome: 'Beatriz Souza Ribeiro',
          vinculo: 'Filho(a) comum do casal',
          idade: '31 anos',
          profissao: 'Arquiteta',
          estado_civil: 'Solteiro(a)',
          regime_bens: 'Não aplicável (Solteiro)',
          conjuge_filhos: 'Sem filhos',
          atua_agro: 'Sim, dedicação parcial / apoio',
          sucessor: 'Em avaliação',
          adiantamento: 'Não',
          obs: 'Auxilia no controle financeiro e notas fiscais'
        }
      ],
      imoveis: [
        {
          nome: 'Fazenda Cachoeira (Sede Café & Pecuária)',
          natureza: 'Rural',
          municipio_uf: 'Patrocínio / MG',
          matricula: 'Mat. 8.410 — CRI Patrocínio',
          titularidade: 'Pessoa Física — Casal (Plena propriedade)',
          area: '340',
          unidade_area: 'ha (hectares)',
          ano_aquisicao: '1994 (Compra)',
          valor_mercado: '14.500.000',
          valor_dirpf: '1.150.000',
          valor_itr: '5.800.000',
          aliquota_itbi: '2,0%',
          utilizacao: 'Exploração própria (Lavoura / Café / Pecuária)',
          situacao_doc: '100% Regular (Matrícula + CAR + CCIR + Geo)',
          onus_garantia: 'Sim — Hipoteca em Cédula Rural (exige anuência)',
          interesse_venda: 'Não (manter no legado da família)'
        },
        {
          nome: 'Fazenda Santa Clara (Gleba Cerrado)',
          natureza: 'Rural',
          municipio_uf: 'Monte Carmelo / MG',
          matricula: 'Mat. 12.905 — CRI Monte Carmelo',
          titularidade: 'Pessoa Física — Casal (Plena propriedade)',
          area: '210',
          unidade_area: 'ha (hectares)',
          ano_aquisicao: '2006 (Compra)',
          valor_mercado: '8.200.000',
          valor_dirpf: '780.000',
          valor_itr: '3.400.000',
          aliquota_itbi: '2,0%',
          utilizacao: 'Arrendamento Rural para terceiros',
          situacao_doc: 'Regular, mas falta Georreferenciamento ou averbação',
          onus_garantia: 'Livre de ônus / Sem garantia bancária',
          interesse_venda: 'Não (manter no legado da família)'
        },
        {
          nome: 'Casa Residencial + Galpão Comercial',
          natureza: 'Urbano',
          municipio_uf: 'Uberlândia / MG',
          matricula: 'Mat. 45.112 — 1º CRI Uberlândia',
          titularidade: 'Pessoa Física — Casal (Plena propriedade)',
          area: '720',
          unidade_area: 'm² (urbano)',
          ano_aquisicao: '2012',
          valor_mercado: '1.800.000',
          valor_dirpf: '620.000',
          valor_itr: '950.000',
          aliquota_itbi: '2,0%',
          utilizacao: 'Uso Residencial da Família',
          situacao_doc: '100% Regular (Matrícula + CAR + CCIR + Geo)',
          onus_garantia: 'Livre de ônus / Sem garantia bancária',
          interesse_venda: 'Não (manter no legado da família)'
        }
      ],
      empresas: [],
      moveis: [
        {
          categoria: 'Lote Consolidado da Frota Agrícola',
          descricao: '4 Tratores John Deere, 1 Colheitadeira de Café, 2 Secadores, 2 Caminhonetes',
          valor_mercado: '2.400.000',
          valor_dirpf: '1.100.000'
        }
      ],
      semoventes: [
        {
          tipo: 'Bovinos de Corte (Cria / Recria / Engorda)',
          quantidade: '580 cabeças Nelore na Fazenda Cachoeira',
          valor_mercado: '2.320.000',
          valor_dirpf: '980.000'
        }
      ],
      financeiros: [
        {
          tipo: 'Safra Estocada (Café, Soja, Milho em Cooperativa/Armazém)',
          instituicao: 'Cooperativa + Aplicações LCA Sicoob/BB',
          valor_mercado: '1.280.000',
          valor_dirpf: '1.280.000'
        }
      ],
      dividas: [
        {
          credor: 'Banco do Brasil S/A',
          modalidade: 'Investimento Rural (PRONAMP / BNDES / Moderfrota)',
          garantia: 'Hipoteca de Imóvel Rural (exige anuência p/ holding)',
          bem_vinculado: 'Matrícula 8.410 — Fazenda Cachoeira',
          saldo_devedor: '1.350.000',
          valor_dirpf: '1.350.000',
          prazo: '36 meses (vence em 2029)',
          situacao: 'Em dia (adimplente)'
        }
      ],
      processos: []
    };
  }

  // ==================== INICIALIZAÇÃO DE EVENTOS ====================

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();

    // Carregar estado salvo ou inicializar linhas vazias
    var loaded = false;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          populateAllData(parsed);
          loaded = true;
        }
      }
    } catch (e) {
      loaded = false;
    }

    if (!loaded) {
      ensureMinimumRows();
      updateKPIsAndDossie();
    }

    // Navegação por abas no topo
    document.querySelectorAll('.diag-step-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchStep(btn.getAttribute('data-step-target'));
      });
    });

    // Botões Avançar / Voltar no rodapé de cada etapa
    document.querySelectorAll('[data-goto-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchStep(btn.getAttribute('data-goto-step'));
      });
    });

    // Botões de adicionar itens nos repeaters
    var addMap = {
      'btn-add-herdeiro': 'herdeiros',
      'btn-add-imovel': 'imoveis',
      'btn-add-imovel-bottom': 'imoveis',
      'btn-add-empresa': 'empresas',
      'btn-add-movel': 'moveis',
      'btn-add-semovente': 'semoventes',
      'btn-add-financeiro': 'financeiros',
      'btn-add-divida': 'dividas',
      'btn-add-processo': 'processos'
    };
    Object.keys(addMap).forEach(function (btnId) {
      var b = document.getElementById(btnId);
      if (b) {
        b.addEventListener('click', function () {
          addRepeaterItem(addMap[btnId], {});
        });
      }
    });

    // Delegação para remover itens dos repeaters e formatar moeda
    var form = document.getElementById('diag-form');
    if (form) {
      form.addEventListener('click', function (ev) {
        var rmBtn = ev.target.closest('[data-remove-item]');
        if (rmBtn) {
          var item = rmBtn.closest('.repeater-item');
          if (item) {
            var type = item.getAttribute('data-repeater');
            item.remove();
            renumberRepeater(type);
            onFormChanged();
          }
        }
      });

      form.addEventListener('input', function () {
        onFormChanged();
      });

      form.addEventListener('change', function (ev) {
        if (ev.target && ev.target.hasAttribute('data-money')) {
          formatMoneyInput(ev.target);
        }
        onFormChanged();
      });
    }

    // Escala de Nota do Legado (0 a 10)
    document.querySelectorAll('#legado-nota-buttons .nota-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nota = btn.getAttribute('data-nota');
        syncNotaButtons(nota);
        onFormChanged();
      });
    });

    // Botão Exemplo Demonstrativo
    var btnExample = document.getElementById('btn-load-example');
    if (btnExample) {
      btnExample.addEventListener('click', function () {
        var ex = getExampleCase();
        populateAllData(ex);
        onFormChanged();
        switchStep(6);
        showFeedback('Caso demonstrativo carregado com sucesso! Veja abaixo o Dossiê Consolidado ou navegue pelas Etapas 1 a 5 para editar.', false);
      });
    }

    // Botão Limpar Ficha
    var btnClear = document.getElementById('btn-clear-all');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        if (!window.confirm('Deseja limpar todos os campos preenchidos neste diagnóstico?')) return;
        localStorage.removeItem(STORAGE_KEY);
        if (form) form.reset();
        syncNotaButtons('');
        Object.keys(repeaterConfigs).forEach(function (type) {
          var c = document.getElementById(repeaterConfigs[type].containerId);
          if (c) c.innerHTML = '';
        });
        ensureMinimumRows();
        updateKPIsAndDossie();
        switchStep(1);
      });
    }

    // Exportar JSON
    function exportJSON() {
      var state = collectAllData();
      var ref = (state.fields.fam_nome_referencia || state.fields.tit1_nome || 'familia')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'diagnostico-raizes-' + (ref || 'cliente') + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('Arquivo .json do diagnóstico baixado com sucesso!', false);
    }

    var btnExp1 = document.getElementById('btn-export-json');
    var btnExp2 = document.getElementById('btn-export-json-top');
    if (btnExp1) btnExp1.addEventListener('click', exportJSON);
    if (btnExp2) btnExp2.addEventListener('click', exportJSON);

    // Importar JSON
    var inpImport = document.getElementById('input-import-json');
    if (inpImport) {
      inpImport.addEventListener('change', function (ev) {
        var file = ev.target.files && ev.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var data = JSON.parse(e.target.result);
            populateAllData(data);
            onFormChanged();
            switchStep(6);
            showFeedback('Diagnóstico importado com sucesso a partir do arquivo JSON!', false);
          } catch (err) {
            showFeedback('Não foi possível ler o arquivo JSON selecionado.', true);
          }
        };
        reader.readAsText(file);
      });
    }

    // Imprimir / Salvar PDF A4
    function triggerPrint() {
      switchStep(6);
      setTimeout(function () {
        window.print();
      }, 150);
    }
    var btnPrint1 = document.getElementById('btn-print-dossie');
    var btnPrint2 = document.getElementById('btn-print-top');
    if (btnPrint1) btnPrint1.addEventListener('click', triggerPrint);
    if (btnPrint2) btnPrint2.addEventListener('click', triggerPrint);

    // Copiar Relatório em Texto
    var btnCopy = document.getElementById('btn-copy-text');
    if (btnCopy) {
      btnCopy.addEventListener('click', function () {
        var state = collectAllData();
        var t = computeTotals(state);
        var txt = buildPlainTextSummary(state, t);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () {
            showFeedback('Relatório copiado para a área de transferência! Você pode colar no WhatsApp ou e-mail.', false);
          });
        }
      });
    }

    // Disparo automático por E-mail para contato@raizes.agr.br (com Dossiê + JSON importável no SaaS)
    function dispatchEmailToRaizes(state, t, showStatus) {
      var f = state.fields || {};
      var nomeCaso = f.fam_nome_referencia || f.tit1_nome || 'Família Não Identificada';
      var resumoTexto = buildPlainTextSummary(state, t);
      var payload = {
        _subject: 'Diagnóstico Patrimonial e Familiar — ' + nomeCaso,
        _template: 'table',
        _captcha: 'false',
        familia_caso: nomeCaso,
        titular_principal: f.tit1_nome || '—',
        whatsapp: f.fam_whatsapp || '—',
        email: f.fam_email || '—',
        cidade_uf: (f.fam_cidade_residencia || f.fam_cidade_origem || '—') + ' / ' + (f.fam_uf_principal || 'MG'),
        patrimonio_mercado: formatBRL(t.totalMerc),
        patrimonio_irpf: formatBRL(t.totalDirpf),
        passivos_dividas: formatBRL(t.totalPassivos),
        patrimonio_liquido: formatBRL(t.patrimonioLiquidoMerc),
        nota_legado: (f.legado_nota !== '' && f.legado_nota !== undefined ? f.legado_nota + '/10' : '—'),
        resumo_dossie: resumoTexto,
        json_importacao_saas: JSON.stringify(state)
      };

      if (showStatus) {
        showFeedback('Enviando diagnóstico completo e arquivo de importação para contato@raizes.agr.br...', false);
      }

      return fetch('https://formsubmit.co/ajax/contato@raizes.agr.br', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (resp) {
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          return resp.json();
        })
        .then(function () {
          if (showStatus) {
            showFeedback('Diagnóstico completo enviado com sucesso para o e-mail da Raízes (contato@raizes.agr.br)!', false);
          }
          return true;
        })
        .catch(function () {
          if (showStatus) {
            var subject = encodeURIComponent('Diagnóstico Patrimonial e Familiar — ' + nomeCaso);
            var body = encodeURIComponent(resumoTexto + '\n\n--- JSON PARA SISTEMA RAÍZES ---\n' + JSON.stringify(state));
            window.location.href = 'mailto:contato@raizes.agr.br?subject=' + subject + '&body=' + body;
            showFeedback('Abrindo seu aplicativo de e-mail com o diagnóstico completo preenchido para contato@raizes.agr.br.', false);
          }
          return false;
        });
    }

    // Enviar somente por E-mail
    var btnEmail = document.getElementById('btn-send-email');
    if (btnEmail) {
      btnEmail.addEventListener('click', function () {
        var consent = document.getElementById('diag_lgpd_consent');
        if (consent && !consent.checked) {
          showFeedback('Por favor, marque a caixa de autorização LGPD antes de enviar o diagnóstico.', true);
          return;
        }
        var state = collectAllData();
        var t = computeTotals(state);
        dispatchEmailToRaizes(state, t, true);
      });
    }

    // Enviar no WhatsApp + Disparo automático por E-mail em segundo plano
    function sendToWhatsApp() {
      var consent = document.getElementById('diag_lgpd_consent');
      if (consent && !consent.checked) {
        showFeedback('Por favor, marque a caixa de autorização LGPD antes de enviar o diagnóstico.', true);
        return;
      }
      var state = collectAllData();
      var t = computeTotals(state);
      // Dispara cópia completa com JSON para o e-mail da Raízes em segundo plano
      dispatchEmailToRaizes(state, t, false);
      var txt = buildPlainTextSummary(state, t);
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(txt);
      window.open(url, '_blank', 'noopener');
      showFeedback('Diagnóstico encaminhado para contato@raizes.agr.br e abrindo conversa no WhatsApp da Raízes...', false);
    }

    var btnWa1 = document.getElementById('btn-send-whatsapp');
    var btnWa2 = document.getElementById('btn-send-whatsapp-bottom');
    if (btnWa1) btnWa1.addEventListener('click', sendToWhatsApp);
    if (btnWa2) btnWa2.addEventListener('click', sendToWhatsApp);
  });
})();
