import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from './theme';

export const entryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: spacing.md,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    backgroundColor: colors.background,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  errorSubText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  productPicker: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  productChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.borderInput,
    marginRight: spacing.sm,
  },
  productChipSelectedSale: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  productChipSelectedPurchase: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  productChipName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  productChipNameSaleSelected: {
    color: colors.successDark,
  },
  productChipNamePurchaseSelected: {
    color: colors.primaryDark,
  },
  productChipStock: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  productChipStockSaleSelected: {
    color: colors.success,
  },
  productChipStockPurchaseSelected: {
    color: colors.primary,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: 6,
    marginBottom: spacing.xs,
  },
  stockOk: {
    backgroundColor: colors.successLight,
  },
  stockError: {
    backgroundColor: colors.dangerLight,
  },
  stockInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noProductBox: {
    padding: spacing.md,
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  noProductText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  totalBannerSale: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  totalBannerPurchase: {
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  totalLabelSale: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.successDark,
  },
  totalLabelPurchase: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  totalValueSale: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.successDark,
    marginVertical: spacing.xs,
  },
  totalValuePurchase: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDark,
    marginVertical: spacing.xs,
  },
  calcFormulaSale: {
    fontSize: 12,
    color: colors.success,
  },
  calcFormulaPurchase: {
    fontSize: 12,
    color: colors.primary,
  },
  submitBtnSale: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnPurchase: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnExpense: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Expense specific
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.borderInput,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: colors.danger,
  },
  previewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  previewLabel: {
    fontSize: 13,
    color: colors.dangerDark,
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 18,
    color: colors.danger,
    fontWeight: '700',
  },
});

