<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { min } from "date-fns";
import { ref } from "vue";
import { useCurrency } from "~/composables/utils/useCurrency";
import { useStatusColor } from "~/composables/utils/useStatusColor";
import type {
  SettlementHistoryDetail,
  SettlementHistoryQuery,
} from "~/models/settlement";

const { t } = useI18n();
const { getStatusBackgroundColor } = useStatusColor();

interface Props {
  settlementHistorys: SettlementHistoryDetail[];
  settlement_id: string;
  totalPage: number;
  total: number;
  onSearchSubmit?: (query: SettlementHistoryQuery) => void;
}
const props = defineProps<Props>();
const settlementHistoryQuery = ref({
  settlement_history_id: props.settlement_id,
  search: "",
  page: 1,
  page_size: 10,
});
const pageSize = ref<{label: string; value: number}>({ label: "10", value: 10 });
const onPageSizeChange = () => {
  settlementHistoryQuery.value.page = 1;
  settlementHistoryQuery.value.page_size = pageSize.value?.value || 10;
  // Emit the search event with the updated query
  props.onSearchSubmit?.(settlementHistoryQuery.value);
};
function onPageUpdate(page: number) {
  settlementHistoryQuery.value.page = page;
  // Emit the search event with the updated query
  props.onSearchSubmit?.(settlementHistoryQuery.value);
}
const table = useTemplateRef("table");
const columns = ref<TableColumn<SettlementHistoryDetail>[]>([
  {
    accessorKey: "supplier.name",
    header: () => t("settlement.supplier"),
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: "cpo.code",
    header: () => t("settlement.biller.code"),
    cell: ({ row }) => row.original.cpo?.code || "N/A",
    size: 150,
    maxSize: 150,
  },
  {
    accessorKey: "cpo.name",
    header: () => t("settlement.biller.name"),
    cell: ({ row }) => row.original.cpo?.name || "N/A",
    size: 200,
    maxSize: 200,
  },
  {
    accessorKey: "settle_amount",
    header: () => t("settlement.settle_amount"),
    cell: ({ row }) => useCurrency().formatAmount(row.original.settle_amount),
    size: 150,
    maxSize: 150,
  },
  // {
  //   accessorKey: "settlement_bank_name",
  //   header: () => t("settlement.settlement_bank"),
  //   size: 100,
  //   maxSize: 100,
  // },
  {
    accessorKey: "status",
    header: () => t("settlement.status"),
    cell: ({ row }) => {
      const status = row.original.status;
      const colorClass = getStatusBackgroundColor(status);
      return h('span', {class: `px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}, status);
    },
    size: 120,
    maxSize: 120,
  },
]);
</script>
<template>
  <UCard class="mb-4">
    <template #header>
      <div class="flex flex-row justify-baseline items-center gap-4">
        <h2 class="text-lg font-semibold">{{ $t("settlement.history") }}</h2>
        <UInput
          v-model="settlementHistoryQuery.search"
          :placeholder="$t('settlement.search_placeholder')"
          class="w-64"
          icon="i-lucide-search"
          @keyup.enter="
            settlementHistoryQuery.page = 1;
            props.onSearchSubmit?.(settlementHistoryQuery);
          "
        />
      </div>
    </template>
    <UTable
      ref="table"
      :data="props.settlementHistorys"
      :columns="columns"
      sticky
      class="w-full h-full"
      :style="{ maxHeight: '400px', minHeight: '300px' }"
    />
    <template #footer>
      <div class="flex items-center gap-4">
        <USelectMenu
          v-model="pageSize"
          :items="APP_CONSTANTS.DEFAULT_PAGE_SIZE_OPTIONS"
          class="w-24"
          @change="onPageSizeChange"
          :search-input="false"
        />
        <UPagination
          v-model="settlementHistoryQuery.page"
          :page-size-options="[10, 25, 50, 100]"
          :page-count="totalPage"
          :items-per-page="settlementHistoryQuery.page_size"
          :total="total"
          v-on:update:page="onPageUpdate"
        />
      </div> 
    </template>
  </UCard>
</template>
