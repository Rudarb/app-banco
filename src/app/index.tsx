import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  Conta,
  ContaCorrente,
  ContaPoupanca,
  ContaSalario,
  PessoaFisica,
  TipoConta,
} from '../Banco';

const iconGlyphs = {
  'cash-outline': '＄',
  'add-circle-outline': '⊕',
  'swap-horizontal-outline': '⇄',
  'eye-off-outline': '⊘',
  'eye-outline': '◉',
  'alert-circle-outline': '!',
  'arrow-up-outline': '↑',
  'arrow-down-outline': '↓',
};

const Ionicons = Object.assign(
  ({ name, size, color }: { name: keyof typeof iconGlyphs; size: number; color: string }) => (
    <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{iconGlyphs[name]}</Text>
  ),
  { glyphMap: iconGlyphs },
);

type Operacao = 'sacar' | 'depositar' | 'transferir';
type Lancamento = { id: number; titulo: string; detalhe: string; valor: number };

function criarBanco() {
  const Gustavo = new PessoaFisica(
    'Rua A, 123', '51999990000', 'Gustavo@email.com',
    'Gustavo', 'Silva', '1234567', '111.222.333-44', new Date(1990, 4, 10)
  );
  Gustavo.renda = 8000;

  const joao = new PessoaFisica(
    'Rua C, 50', '5100000000', 'joao@email.com',
    'João', 'Souza', '7654321', '999.888.777-66', new Date(2000, 1, 1)
  );

  const cc = new ContaCorrente(Gustavo, 1001, 1, TipoConta.ESPECIAL);
  const poup = new ContaPoupanca(Gustavo, 2001, 1);
  const sal = new ContaSalario(Gustavo, 3001, 1);
  const ccJoao = new ContaCorrente(joao, 1002, 1, TipoConta.SIMPLES);

  cc.depositar(1000);
  poup.depositar(500);
  sal.receberSalario(2000);

  return { minhas: [cc, poup, sal] as Conta[], todas: [cc, poup, sal, ccJoao] as Conta[] };
}

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function rotulo(c: Conta): string {
  if (c instanceof ContaCorrente) return 'Conta corrente';
  if (c instanceof ContaPoupanca) return 'Poupança';
  return 'Conta salário';
}

function nomeTitular(c: Conta): string {
  return c.titular instanceof PessoaFisica ? c.titular.nome : 'Empresa';
}

const ATALHOS: { chave: Operacao; nome: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { chave: 'sacar', nome: 'Sacar', icone: 'cash-outline' },
  { chave: 'depositar', nome: 'Depositar', icone: 'add-circle-outline' },
  { chave: 'transferir', nome: 'Transferir', icone: 'swap-horizontal-outline' },
];

const TITULO_FORM: Record<Operacao, string> = {
  sacar: 'Quanto você quer sacar?',
  depositar: 'Quanto você quer depositar?',
  transferir: 'Para quem você quer transferir?',
};

export default function Index() {
  const [banco] = useState(criarBanco);
  const [, setVersao] = useState(0);

  const [numeroSelecionado, setNumeroSelecionado] = useState(banco.minhas[0].numero);
  const [operacao, setOperacao] = useState<Operacao>('transferir');
  const [valorTxt, setValorTxt] = useState('');
  const [destinoTxt, setDestinoTxt] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [saldoOculto, setSaldoOculto] = useState(false);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);

  const conta = banco.minhas.find((c) => c.numero === numeroSelecionado)!;
  const saldo = conta.consultarSaldo();
  const destino = banco.todas.find((c) => String(c.numero) === destinoTxt.trim());

  function executar() {
    try {
      const valor = Number(valorTxt.replace(',', '.'));
      if (valorTxt.trim() === '' || isNaN(valor)) {
        throw new Error('Digite um valor numérico. Exemplo: 150,50');
      }

      const saldoAntes = conta.consultarSaldo();
      let titulo = '';
      let detalhe = rotulo(conta);

      if (operacao === 'sacar') {
        conta.sacar(valor);
        titulo = 'Saque';
      } else if (operacao === 'depositar') {
        if (conta instanceof ContaSalario) conta.receberSalario(valor);
        else if (conta instanceof ContaCorrente || conta instanceof ContaPoupanca) {
          conta.depositar(valor);
        }
        titulo = 'Depósito';
      } else {
        if (destinoTxt.trim() === '') throw new Error('Informe o número da conta de destino.');
        if (!destino) throw new Error('Conta de destino não encontrada.');
        conta.transferir(destino, valor);
        titulo = 'Transferência enviada';
        detalhe = `${nomeTitular(destino)} · conta ${destino.numero}`;
      }

      const variacao = conta.consultarSaldo() - saldoAntes;
      setLancamentos((l) => [{ id: Date.now(), titulo, detalhe, valor: variacao }, ...l]);
      setErro(null);
      setValorTxt('');
      setDestinoTxt('');
      setVersao((v) => v + 1);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.scroll}>
      <View style={s.pagina}>
        <View style={s.cabecalho}>
          <View style={s.cabecalhoTopo}>
            <View style={s.avatar}>
              <Text style={s.avatarTexto}>{nomeTitular(conta).charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.ola}>Olá, {nomeTitular(conta)}</Text>
              <Text style={s.agencia}>
                Agência {conta.agencia} · Conta {conta.numero}
              </Text>
            </View>
            <Pressable onPress={() => setSaldoOculto((v) => !v)} hitSlop={10}>
              <Ionicons
                name={saldoOculto ? 'eye-off-outline' : 'eye-outline'}
                size={26}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.contas}>
            {banco.minhas.map((c) => {
              const ativa = c.numero === numeroSelecionado;
              return (
                <Pressable
                  key={c.numero}
                  onPress={() => {
                    setNumeroSelecionado(c.numero);
                    setErro(null);
                  }}
                  style={[s.chip, ativa && s.chipAtivo]}
                >
                  <Text style={[s.chipTexto, ativa && s.chipTextoAtivo]}>{rotulo(c)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={s.cartaoSaldo}>
          <Text style={s.saldoRotulo}>Saldo em {rotulo(conta).toLowerCase()}</Text>
          <Text style={[s.saldoValor, saldo < 0 && s.saldoNegativo]}>
            {saldoOculto ? 'R$ ••••••' : moeda(saldo)}
          </Text>
          <View style={s.divisor} />
          {conta instanceof ContaCorrente && (
            <>
              <Text style={s.info}>Limite do cheque especial: {moeda(conta.limite)}</Text>
              <Text style={s.info}>Taxa de saque: R$ 5,00</Text>
            </>
          )}
          {conta instanceof ContaPoupanca && <Text style={s.info}>Taxa de saque: R$ 2,50</Text>}
          {conta instanceof ContaSalario && (
            <Text style={s.info}>Transfere apenas para contas do mesmo titular.</Text>
          )}
        </View>

        <View style={s.atalhos}>
          {ATALHOS.map((a) => {
            const ativo = a.chave === operacao;
            return (
              <Pressable
                key={a.chave}
                style={s.atalho}
                onPress={() => {
                  setOperacao(a.chave);
                  setErro(null);
                }}
              >
                <View style={[s.atalhoIcone, ativo && s.atalhoIconeAtivo]}>
                  <Ionicons name={a.icone} size={28} color={ativo ? '#FFFFFF' : '#00478F'} />
                </View>
                <Text style={[s.atalhoTexto, ativo && s.atalhoTextoAtivo]}>{a.nome}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.formulario}>
          <Text style={s.formTitulo}>{TITULO_FORM[operacao]}</Text>

          {operacao === 'transferir' && (
            <>
              <Text style={s.label}>Conta de destino</Text>
              <TextInput
                style={s.input}
                placeholder="Número da conta"
                placeholderTextColor="#8A97A5"
                keyboardType="number-pad"
                value={destinoTxt}
                onChangeText={setDestinoTxt}
              />
              {destinoTxt.trim() !== '' && (
                <Text style={destino ? s.dica : s.dicaErro}>
                  {destino
                    ? `${nomeTitular(destino)} · ${rotulo(destino)}`
                    : 'Nenhuma conta com esse número.'}
                </Text>
              )}
              <Text style={s.dica}>
                Contas: 1001, 2001, 3001 (suas) e 1002 (João).
              </Text>
            </>
          )}

          <Text style={s.label}>Valor</Text>
          <View style={s.inputValor}>
            <Text style={s.prefixo}>R$</Text>
            <TextInput
              style={s.inputValorTexto}
              placeholder="0,00"
              placeholderTextColor="#8A97A5"
              keyboardType="decimal-pad"
              value={valorTxt}
              onChangeText={setValorTxt}
            />
          </View>

          {erro && (
            <View style={s.erro}>
              <Ionicons name="alert-circle-outline" size={20} color="#B3261E" />
              <Text style={s.erroTexto}>{erro}</Text>
            </View>
          )}

          <Pressable style={s.botao} onPress={executar}>
            <Text style={s.botaoTexto}>Confirmar</Text>
          </Pressable>
        </View>

        <Text style={s.secao}>Últimos lançamentos</Text>
        <View style={s.lista}>
          {lancamentos.length === 0 ? (
            <Text style={s.vazio}>Nenhum lançamento ainda. Faça uma operação acima.</Text>
          ) : (
            lancamentos.map((l, i) => (
              <View key={l.id} style={[s.item, i > 0 && s.itemBorda]}>
                <View style={s.itemIcone}>
                  <Ionicons
                    name={l.valor < 0 ? 'arrow-up-outline' : 'arrow-down-outline'}
                    size={20}
                    color="#00478F"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitulo}>{l.titulo}</Text>
                  <Text style={s.itemDetalhe}>{l.detalhe}</Text>
                </View>
                <Text style={[s.itemValor, l.valor < 0 && s.itemValorNegativo]}>
                  {l.valor < 0 ? '- ' : '+ '}
                  {moeda(Math.abs(l.valor))}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const AZUL = '#00478F';
const AZUL_ESCURO = '#00356B';
const AMARELO = '#FFC20E';
const TEXTO = '#1B2733';
const SUAVE = '#5F6E7C';
const BORDA = '#DCE3EA';

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F2F5F8' },
  scroll: { paddingBottom: 40 },
  pagina: { width: '100%', maxWidth: 520, alignSelf: 'center' },

  cabecalho: {
    backgroundColor: AZUL,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 64,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cabecalhoTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: AMARELO,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTexto: { fontSize: 20, fontWeight: '700', color: AZUL_ESCURO },
  ola: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  agencia: { color: '#BFD3EA', fontSize: 13, marginTop: 2 },

  contas: { gap: 8, marginTop: 18 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#4F7FB5',
  },
  chipAtivo: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  chipTexto: { color: '#DCE8F5', fontSize: 14, fontWeight: '600' },
  chipTextoAtivo: { color: AZUL },

  cartaoSaldo: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: -44, borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: BORDA,
  },
  saldoRotulo: { color: SUAVE, fontSize: 14 },
  saldoValor: { color: TEXTO, fontSize: 32, fontWeight: '700', marginTop: 4 },
  saldoNegativo: { color: '#B3261E' },
  divisor: { height: 1, backgroundColor: BORDA, marginVertical: 12 },
  info: { color: SUAVE, fontSize: 13, marginTop: 2 },

  atalhos: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, paddingHorizontal: 12 },
  atalho: { alignItems: 'center', gap: 8, width: 96 },
  atalhoIcone: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: BORDA, alignItems: 'center', justifyContent: 'center',
  },
  atalhoIconeAtivo: { backgroundColor: AZUL, borderColor: AZUL },
  atalhoTexto: { fontSize: 14, color: TEXTO, fontWeight: '500' },
  atalhoTextoAtivo: { color: AZUL, fontWeight: '700' },

  formulario: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 24, borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: BORDA,
  },
  formTitulo: { fontSize: 18, fontWeight: '700', color: TEXTO, marginBottom: 4 },
  label: { fontSize: 14, color: SUAVE, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: BORDA, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 17, color: TEXTO, backgroundColor: '#FAFBFC',
  },
  inputValor: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDA,
    borderRadius: 10, paddingHorizontal: 14, backgroundColor: '#FAFBFC',
  },
  prefixo: { fontSize: 20, color: SUAVE, marginRight: 8, fontWeight: '600' },
  inputValorTexto: { flex: 1, paddingVertical: 12, fontSize: 24, fontWeight: '700', color: TEXTO },
  dica: { fontSize: 13, color: SUAVE, marginTop: 6 },
  dicaErro: { fontSize: 13, color: '#B3261E', marginTop: 6 },

  erro: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FCE8E6',
    borderRadius: 10, padding: 12, marginTop: 14,
  },
  erroTexto: { flex: 1, color: '#B3261E', fontSize: 14 },

  botao: {
    backgroundColor: AZUL, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 18,
    borderBottomWidth: 3, borderBottomColor: AMARELO,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  secao: { fontSize: 18, fontWeight: '700', color: TEXTO, marginTop: 28, marginBottom: 10, marginHorizontal: 20 },
  lista: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14,
    borderWidth: 1, borderColor: BORDA, paddingHorizontal: 16,
  },
  vazio: { color: SUAVE, fontSize: 14, paddingVertical: 18 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  itemBorda: { borderTopWidth: 1, borderTopColor: BORDA },
  itemIcone: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#E6EEF7',
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitulo: { fontSize: 15, fontWeight: '600', color: TEXTO },
  itemDetalhe: { fontSize: 13, color: SUAVE, marginTop: 2 },
  itemValor: { fontSize: 15, fontWeight: '700', color: AZUL },
  itemValorNegativo: { color: TEXTO },
});