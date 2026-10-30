export type FaixaEtaria = "criança" | "jovem" | "adulto" | "idoso";

class Auxiliar {
  static calcularIdade(data: Date): number {
    const hoje = new Date();
    let idade = hoje.getFullYear() - data.getFullYear();
    const mes = hoje.getMonth() - data.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
      idade--;
    }
    return idade;
  }

  static faixaEtaria(idade: number): FaixaEtaria {
    if (idade <= 11) return "criança";
    if (idade <= 21) return "jovem";
    if (idade <= 59) return "adulto";
    return "idoso";
  }
}

function obrigatorio(valor: string | undefined | null, campo: string): string {
  if (valor === undefined || valor === null || valor.trim() === "") {
    throw new Error(`O campo "${campo}" é obrigatório.`);
  }
  return valor.trim();
}

function dataValida(data: Date, campo: string): Date {
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    throw new Error(`O campo "${campo}" é obrigatório e deve ser uma data válida.`);
  }
  if (data.getTime() > Date.now()) {
    throw new Error(`O campo "${campo}" não pode ser uma data futura.`);
  }
  return data;
}

export abstract class Pessoa {
  static numeroDePessoas: number = 0;

  private _id: number;
  private _endereco: string;
  private _tel: string;
  private _email: string;

  constructor(endereco: string, tel: string, email: string) {
    this._endereco = obrigatorio(endereco, "endereço");
    this._tel = obrigatorio(tel, "telefone");
    this._email = obrigatorio(email, "e-mail");
    Pessoa.numeroDePessoas++;
    this._id = Pessoa.numeroDePessoas;
  }

  get id(): number {
    return this._id;
  }

  get endereco(): string {
    return this._endereco;
  }
  set endereco(valor: string) {
    this._endereco = obrigatorio(valor, "endereço");
  }

  get tel(): string {
    return this._tel;
  }
  set tel(valor: string) {
    this._tel = obrigatorio(valor, "telefone");
  }

  get email(): string {
    return this._email;
  }
  set email(valor: string) {
    this._email = obrigatorio(valor, "e-mail");
  }

  abstract get rendaOuFaturamento(): number;
}

export class PessoaFisica extends Pessoa {
  private _nome: string;
  private _sobrenome: string;
  private _rg: string;
  private _cpf: string;
  private _dataNasc: Date;
  private _renda: number = 0;

  constructor(
    endereco: string,
    tel: string,
    email: string,
    nome: string,
    sobrenome: string,
    rg: string,
    cpf: string,
    dataNasc: Date
  ) {
    super(endereco, tel, email);
    this._nome = obrigatorio(nome, "nome");
    this._sobrenome = obrigatorio(sobrenome, "sobrenome");
    this._rg = obrigatorio(rg, "rg");
    this._cpf = obrigatorio(cpf, "cpf");
    this._dataNasc = dataValida(dataNasc, "data de nascimento");
  }

  get nome(): string {
    return this._nome;
  }
  set nome(valor: string) {
    this._nome = obrigatorio(valor, "nome");
  }

  get sobrenome(): string {
    return this._sobrenome;
  }
  set sobrenome(valor: string) {
    this._sobrenome = obrigatorio(valor, "sobrenome");
  }

  get rg(): string {
    return this._rg;
  }
  set rg(valor: string) {
    this._rg = obrigatorio(valor, "rg");
  }

  get cpf(): string {
    return this._cpf;
  }
  set cpf(valor: string) {
    this._cpf = obrigatorio(valor, "cpf");
  }

  get dataNasc(): Date {
    return this._dataNasc;
  }
  set dataNasc(valor: Date) {
    this._dataNasc = dataValida(valor, "data de nascimento");
  }

  get idade(): number {
    return Auxiliar.calcularIdade(this._dataNasc);
  }

  get faixaEtaria(): FaixaEtaria {
    return Auxiliar.faixaEtaria(this.idade);
  }

  get renda(): number {
    return this._renda;
  }
  set renda(valor: number) {
    if (valor < 0) throw new Error("A renda não pode ser negativa.");
    this._renda = valor;
  }

  get rendaOuFaturamento(): number {
    return this._renda;
  }
}

export class PessoaJuridica extends Pessoa {
  private _socios: PessoaFisica[];
  private _cnpj: string;
  private _razaoSocial: string;
  private _nomeFantasia: string;
  private _inscrEstadual: string;
  private _dataAbertura: Date;
  private _faturamento: number = 0;

  constructor(
    endereco: string,
    tel: string,
    email: string,
    socios: PessoaFisica[],
    cnpj: string,
    razaoSocial: string,
    nomeFantasia: string,
    inscrEstadual: string,
    dataAbertura: Date
  ) {
    super(endereco, tel, email);
    if (!socios || socios.length === 0) {
      throw new Error("A lista de sócios é obrigatória (mínimo 1 sócio).");
    }
    this._socios = [...socios];
    this._cnpj = obrigatorio(cnpj, "cnpj");
    this._razaoSocial = obrigatorio(razaoSocial, "razão social");
    this._nomeFantasia = obrigatorio(nomeFantasia, "nome fantasia");
    this._inscrEstadual = obrigatorio(inscrEstadual, "inscrição estadual");
    this._dataAbertura = dataValida(dataAbertura, "data de abertura");
  }

  get socios(): PessoaFisica[] {
    return [...this._socios];
  }
  adicionarSocio(socio: PessoaFisica): void {
    this._socios.push(socio);
  }
  removerSocio(socio: PessoaFisica): void {
    if (this._socios.length === 1) {
      throw new Error("A empresa precisa ter ao menos um sócio.");
    }
    this._socios = this._socios.filter((s) => s.id !== socio.id);
  }

  get cnpj(): string {
    return this._cnpj;
  }
  set cnpj(valor: string) {
    this._cnpj = obrigatorio(valor, "cnpj");
  }

  get razaoSocial(): string {
    return this._razaoSocial;
  }
  set razaoSocial(valor: string) {
    this._razaoSocial = obrigatorio(valor, "razão social");
  }

  get nomeFantasia(): string {
    return this._nomeFantasia;
  }
  set nomeFantasia(valor: string) {
    this._nomeFantasia = obrigatorio(valor, "nome fantasia");
  }

  get inscrEstadual(): string {
    return this._inscrEstadual;
  }
  set inscrEstadual(valor: string) {
    this._inscrEstadual = obrigatorio(valor, "inscrição estadual");
  }

  get dataAbertura(): Date {
    return this._dataAbertura;
  }
  set dataAbertura(valor: Date) {
    this._dataAbertura = dataValida(valor, "data de abertura");
  }

  get idade(): number {
    return Auxiliar.calcularIdade(this._dataAbertura);
  }

  get faturamento(): number {
    return this._faturamento;
  }
  set faturamento(valor: number) {
    if (valor < 0) throw new Error("O faturamento não pode ser negativo.");
    this._faturamento = valor;
  }

  get rendaOuFaturamento(): number {
    return this._faturamento;
  }
}

export interface Depositavel {
  depositar(valor: number): void;
}

export abstract class Conta {
  private _titular: Pessoa;
  private _numero: number;
  private _agencia: number;
  protected saldo: number = 0;
  protected taxaSaque: number;

  constructor(titular: Pessoa, numero: number, agencia: number, taxaSaque: number) {
    if (!titular) throw new Error("Toda conta deve ter um titular.");
    if (taxaSaque < 0) throw new Error("A taxa de saque não pode ser negativa.");
    this._titular = titular;
    this._numero = numero;
    this._agencia = agencia;
    this.taxaSaque = taxaSaque;
  }

  get titular(): Pessoa {
    return this._titular;
  }
  get numero(): number {
    return this._numero;
  }
  get agencia(): number {
    return this._agencia;
  }

  sacar(valor: number): void {
    this.debitar(valor, true);
  }

  consultarSaldo(): number {
    return this.saldo;
  }

  transferir(destino: Conta, valor: number): void {
    if (destino === this) {
      throw new Error("Não é possível transferir para a própria conta.");
    }
    this.validarTransferencia(destino);
    this.debitar(valor, false);
    destino.creditar(valor);
  }

  protected limiteNegativo(): number {
    return 0;
  }

  protected calcularTotalDebito(valor: number, cobrarTaxaSaque: boolean): number {
    return valor + (cobrarTaxaSaque ? this.taxaSaque : 0);
  }

  protected validarTransferencia(_destino: Conta): void {}

  protected validarValor(valor: number): void {
    if (!(valor > 0)) throw new Error("O valor da operação deve ser maior que zero.");
  }

  protected debitar(valor: number, cobrarTaxaSaque: boolean): void {
    this.validarValor(valor);
    const total = this.calcularTotalDebito(valor, cobrarTaxaSaque);
    if (this.saldo - total < -this.limiteNegativo()) {
      throw new Error("Saldo insuficiente.");
    }
    this.saldo -= total;
  }

  protected creditar(valor: number): void {
    this.validarValor(valor);
    this.saldo += valor;
  }
}

export class ContaSalario extends Conta {
  constructor(titular: Pessoa, numero: number, agencia: number) {
    super(titular, numero, agencia, 0);
  }

  // Salário é creditado pelo empregador (não é um depósito comum)
  receberSalario(valor: number): void {
    this.creditar(valor);
  }

  protected validarTransferencia(destino: Conta): void {
    if (destino.titular.id !== this.titular.id) {
      throw new Error(
        "Conta salário só pode transferir para contas do mesmo titular."
      );
    }
  }
}

export class ContaPoupanca extends Conta implements Depositavel {
  static readonly TAXA_SAQUE: number = 2.5;

  constructor(titular: Pessoa, numero: number, agencia: number) {
    super(titular, numero, agencia, ContaPoupanca.TAXA_SAQUE);
  }

  depositar(valor: number): void {
    this.creditar(valor);
  }
}

export enum TipoConta {
  SIMPLES = "SIMPLES",
  ESPECIAL = "ESPECIAL",
}

export class ContaCorrente extends Conta implements Depositavel {
  static readonly RENDA_MINIMA_ESPECIAL: number = 5000;
  static readonly TAXA_SAQUE: number = 5;

  private readonly _tipo: TipoConta;
  private readonly _limite: number;
  private readonly _taxaDoLimite: number;

  constructor(titular: Pessoa, numero: number, agencia: number, tipo: TipoConta) {
    super(titular, numero, agencia, ContaCorrente.TAXA_SAQUE);

    const renda = titular.rendaOuFaturamento;

    if (tipo === TipoConta.ESPECIAL && !(renda > ContaCorrente.RENDA_MINIMA_ESPECIAL)) {
      throw new Error(
        "Conta especial exige renda/faturamento superior a R$ 5.000,00."
      );
    }

    this._tipo = tipo;
    this._limite = renda * (tipo === TipoConta.ESPECIAL ? 2.5 : 1.5);
    this._taxaDoLimite = tipo === TipoConta.ESPECIAL ? 0.02 : 0.05;
  }

  get tipo(): TipoConta {
    return this._tipo;
  }
  get limite(): number {
    return this._limite;
  }
  get taxaDoLimite(): number {
    return this._taxaDoLimite;
  }

  protected limiteNegativo(): number {
    return this._limite;
  }

  protected calcularTotalDebito(valor: number, cobrarTaxaSaque: boolean): number {
    const total = super.calcularTotalDebito(valor, cobrarTaxaSaque);
    const parteCobertaPeloSaldo = Math.max(this.saldo, 0);
    const parteDoLimite = Math.max(0, total - parteCobertaPeloSaldo);
    return total + parteDoLimite * this._taxaDoLimite;
  }

  depositar(valor: number): void {
    this.creditar(valor);
  }

  pagar(codigoBarras: string, valor: number): void {
    obrigatorio(codigoBarras, "código de barras");
    this.debitar(valor, false);
  }

  emprestimo(valor: number): void {
    this.validarValor(valor);
    if (valor > this._limite) {
      throw new Error("Valor do empréstimo excede o limite da conta.");
    }
    this.creditar(valor);
  }
}