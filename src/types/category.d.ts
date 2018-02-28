import { CategoryRule } from "./category-rule";

export type Category = {
  id: string;
  name: string;
  category_rules: CategoryRule;
  className: string;
  hidden_on_cat_list?: boolean;
  hidden_on_txn_list?: boolean;
  hidden_on_running_total?: boolean;
  txn_month_modifier?: number;
};
