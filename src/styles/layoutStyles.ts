import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from './theme';

export const layoutStyles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    height: 60,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs + 2,
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.card,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logoutBtn: {
    marginRight: spacing.lg,
    padding: spacing.xs + 2,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  notFoundLink: {
    marginTop: 15,
    paddingVertical: 10,
  },
  notFoundLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

