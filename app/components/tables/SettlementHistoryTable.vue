<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { ref } from 'vue';
import { useCurrency } from '~/composables/utils/useCurrency';
import type { SettlementHistoryDetail } from '~/models/settlement';
import settlementHistory from '~~/server/api/settlement-history';

const { t } = useI18n();
interface Props {
    settlementHistorys: SettlementHistoryDetail[];
}
const props = defineProps<Props>();
const columns = ref<TableColumn<SettlementHistoryDetail>[]>([
    {
        accessorKey: 'supplier.name',
        header: () => t('settlement.supplier'),
        size: 150,
        maxSize: 150,
    },
    {
        accessorKey: 'cpo.code',
        header: () => t('settlement.cpo.code'),
        cell: ({ row }) => row.original.cpo?.code || 'N/A',
        size: 150,
        maxSize: 150,
    },
    {
        accessorKey: 'cpo.name',
        header: () => t('settlement.cpo.name'),
        cell: ({ row }) => row.original.cpo?.name || 'N/A',
        size: 200,
        maxSize: 200,
    },
    {
        accessorKey: 'settle_amount',
        header: () => t('settlement.settle_amount'),
        cell: ({ row }) => useCurrency().formatAmount(row.original.settle_amount),
        size: 150,
        maxSize: 150,
    },
    {
        accessorKey: 'settlement_bank_name',
        header: () => t('settlement.settlement_bank'),
        size: 100,
        maxSize: 100,
    },
    {
        accessorKey: 'status',
        header: () => t('settlement.status'),
        size: 120,
        maxSize: 120,
    }
]);
</script>
<template>
    <UCard class="mb-4">
        <template #header>
        <h2 class="text-lg font-semibold">{{ $t('settlement.history') }}</h2>
        </template>
        <UTable
        ref="table"
        :data="props.settlementHistorys"
        :columns="columns"
        sticky
        class="w-full"
        :style="{ maxHeight: '400px' }"
        />
    </UCard>
</template>