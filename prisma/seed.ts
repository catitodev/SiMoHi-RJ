import { PrismaClient } from '@prisma/client';
import { MACRORREGIOES, SUB_BACIAS, ESTACOES_REAIS } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do SiMoHi-RJ...');

  // 1. MRAs
  for (const mra of MACRORREGIOES) {
    await prisma.macrorregiaoAmbiental.upsert({
      where: { codigo: mra.codigo },
      update: { nome: mra.nome, areaKm2: mra.areaKm2, descricao: mra.descricao },
      create: {
        id: mra.id,
        codigo: mra.codigo,
        nome: mra.nome,
        areaKm2: mra.areaKm2,
        descricao: mra.descricao,
      },
    });
  }
  console.log(`✅ ${MACRORREGIOES.length} MRAs criadas`);

  // 2. Sub-bacias
  for (const sb of SUB_BACIAS) {
    await prisma.subBaciaHidrografica.upsert({
      where: { codigo: sb.codigo },
      update: { nome: sb.nome, nivelRiscoMedio: sb.nivelRiscoMedio },
      create: {
        id: sb.id,
        codigo: sb.codigo,
        nome: sb.nome,
        macrorregiaoId: sb.macrorregiaoId,
        rioPrincipal: sb.rioPrincipal,
        areaKm2: sb.areaKm2,
        populacaoEstimada: sb.populacaoEstimada,
        nivelRiscoMedio: sb.nivelRiscoMedio,
      },
    });
  }
  console.log(`✅ ${SUB_BACIAS.length} sub-bacias criadas`);

  // 3. Estações
  for (const estacao of ESTACOES_REAIS) {
    await prisma.estacaoMonitoramento.upsert({
      where: { codigo: estacao.codigo },
      update: { nome: estacao.nome, latitude: estacao.latitude, longitude: estacao.longitude },
      create: {
        codigo: estacao.codigo,
        nome: estacao.nome,
        fonte: estacao.fonte,
        tipo: estacao.tipo,
        latitude: estacao.latitude,
        longitude: estacao.longitude,
        subBaciaId: estacao.subBaciaId,
      },
    });
  }
  console.log(`✅ ${ESTACOES_REAIS.length} estações criadas`);

  console.log('🎉 Seed concluído!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());