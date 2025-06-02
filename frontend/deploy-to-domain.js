/**
 * Script para automatizar o deploy para seu domínio
 * Este script irá construir seu aplicativo e preparar para envio ao seu servidor
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuração do domínio - substitua pelos seus valores
const config = {
  domainName: 'agenciagvcompany.com.br', // Substitua pelo seu domínio
  buildFolder: path.resolve(__dirname, 'build'),
  deployFolder: path.resolve(__dirname, '../deploy')
};

// Verificar se o diretório de deploy existe, se não, criar
if (!fs.existsSync(config.deployFolder)) {
  console.log('Criando pasta de deploy...');
  fs.mkdirSync(config.deployFolder, { recursive: true });
}

// Função para construir o projeto
function buildProject() {
  try {
    console.log('\n=== Instalando dependências... ===');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\n=== Construindo projeto otimizado... ===');
    execSync('npm run build', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('Erro ao construir o projeto:', error.message);
    return false;
  }
}

// Função para preparar arquivos para envio
function prepareDeployFiles() {
  try {
    console.log('\n=== Preparando arquivos para deploy... ===');
    
    // Copiar arquivos da pasta build para a pasta deploy
    fs.cpSync(config.buildFolder, config.deployFolder, { recursive: true });
    
    // Criar ou atualizar o arquivo CNAME no deploy
    fs.writeFileSync(
      path.join(config.deployFolder, 'CNAME'),
      config.domainName
    );
    
    console.log(`\n=== Deploy preparado com sucesso! ===`);
    console.log(`Os arquivos estão prontos na pasta: ${config.deployFolder}`);
    console.log('\nPara completar o deploy:');
    console.log('1. Faça upload destes arquivos para o seu servidor web');
    console.log('2. Configure seu domínio para apontar para este servidor');
    console.log('\nSeu site estará disponível em:');
    console.log(`https://${config.domainName}`);
    
    return true;
  } catch (error) {
    console.error('Erro ao preparar arquivos para deploy:', error.message);
    return false;
  }
}

// Executar o processo de deploy
(async function deploy() {
  console.log('\n=== INICIANDO DEPLOY PARA O DOMÍNIO ===');
  console.log(`Domínio de destino: ${config.domainName}`);
  
  const buildSuccess = buildProject();
  if (!buildSuccess) {
    console.error('\nO processo de build falhou. Corrigindo os erros antes de continuar.');
    return;
  }
  
  const deploySuccess = prepareDeployFiles();
  if (!deploySuccess) {
    console.error('\nO processo de preparação para deploy falhou.');
    return;
  }
  
  console.log('\n=== PROCESSO CONCLUÍDO COM SUCESSO! ===');
})();
