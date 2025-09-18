import { relations } from "drizzle-orm/relations";
import { users, poAttachments, pfPo, platformPoAttachments, cityMallPoHeader, cityMallPoLines, dealsharePoHeader, dealsharePoItems, pfMst, pfItemMst, pfOrderItems, companies, poMaster, distributors, districts, platforms, states, secondarySalesHeader, secondarySalesItems, zeptoPoHeader, zeptoPoLines, poLines, zomatoPoHeader, zomatoPoItems, distributorPo, distributorOrderItems, bigbasketPoHeader, bigbasketPoLines, platformProductCodes, blinkitPoHeader, blinkitPoLines, swiggyPos, swiggyPoLines, masterPoHeader, masterPoLines, amazonPoHeader, amazonPoLines, roles, rolePermissions, permissions, userSessions, flipkartGroceryPoHeader, flipkartGroceryPoLines } from "./schema";

export const poAttachmentsRelations = relations(poAttachments, ({one}) => ({
	user: one(users, {
		fields: [poAttachments.uploadedBy],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	poAttachments: many(poAttachments),
	platformPoAttachments: many(platformPoAttachments),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	user: one(users, {
		fields: [users.createdBy],
		references: [users.id],
		relationName: "users_createdBy_users_id"
	}),
	users: many(users, {
		relationName: "users_createdBy_users_id"
	}),
	userSessions: many(userSessions),
}));

export const platformPoAttachmentsRelations = relations(platformPoAttachments, ({one}) => ({
	pfPo: one(pfPo, {
		fields: [platformPoAttachments.poId],
		references: [pfPo.id]
	}),
	user: one(users, {
		fields: [platformPoAttachments.uploadedBy],
		references: [users.id]
	}),
}));

export const pfPoRelations = relations(pfPo, ({one, many}) => ({
	platformPoAttachments: many(platformPoAttachments),
	pfOrderItems: many(pfOrderItems),
	district: one(districts, {
		fields: [pfPo.districtId],
		references: [districts.id]
	}),
	pfMst: one(pfMst, {
		fields: [pfPo.platform],
		references: [pfMst.id]
	}),
	state: one(states, {
		fields: [pfPo.stateId],
		references: [states.id]
	}),
}));

export const cityMallPoLinesRelations = relations(cityMallPoLines, ({one}) => ({
	cityMallPoHeader: one(cityMallPoHeader, {
		fields: [cityMallPoLines.poHeaderId],
		references: [cityMallPoHeader.id]
	}),
}));

export const cityMallPoHeaderRelations = relations(cityMallPoHeader, ({many}) => ({
	cityMallPoLines: many(cityMallPoLines),
}));

export const dealsharePoItemsRelations = relations(dealsharePoItems, ({one}) => ({
	dealsharePoHeader: one(dealsharePoHeader, {
		fields: [dealsharePoItems.poHeaderId],
		references: [dealsharePoHeader.id]
	}),
}));

export const dealsharePoHeaderRelations = relations(dealsharePoHeader, ({many}) => ({
	dealsharePoItems: many(dealsharePoItems),
}));

export const pfItemMstRelations = relations(pfItemMst, ({one}) => ({
	pfMst: one(pfMst, {
		fields: [pfItemMst.pfId],
		references: [pfMst.id]
	}),
}));

export const pfMstRelations = relations(pfMst, ({many}) => ({
	pfItemMsts: many(pfItemMst),
	poMasters: many(poMaster),
	pfPos: many(pfPo),
}));

export const pfOrderItemsRelations = relations(pfOrderItems, ({one}) => ({
	pfPo: one(pfPo, {
		fields: [pfOrderItems.poId],
		references: [pfPo.id]
	}),
}));

export const poMasterRelations = relations(poMaster, ({one, many}) => ({
	company: one(companies, {
		fields: [poMaster.companyId],
		references: [companies.id]
	}),
	distributor: one(distributors, {
		fields: [poMaster.distributorId],
		references: [distributors.id]
	}),
	district: one(districts, {
		fields: [poMaster.districtId],
		references: [districts.id]
	}),
	platform: one(platforms, {
		fields: [poMaster.platformId],
		references: [platforms.id]
	}),
	pfMst: one(pfMst, {
		fields: [poMaster.platformId],
		references: [pfMst.id]
	}),
	poLines: many(poLines),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	poMasters: many(poMaster),
}));

export const distributorsRelations = relations(distributors, ({many}) => ({
	poMasters: many(poMaster),
}));

export const districtsRelations = relations(districts, ({many}) => ({
	poMasters: many(poMaster),
	pfPos: many(pfPo),
}));

export const platformsRelations = relations(platforms, ({many}) => ({
	poMasters: many(poMaster),
	platformProductCodes: many(platformProductCodes),
}));

export const statesRelations = relations(states, ({many}) => ({
	pfPos: many(pfPo),
}));

export const secondarySalesItemsRelations = relations(secondarySalesItems, ({one}) => ({
	secondarySalesHeader: one(secondarySalesHeader, {
		fields: [secondarySalesItems.headerId],
		references: [secondarySalesHeader.id]
	}),
}));

export const secondarySalesHeaderRelations = relations(secondarySalesHeader, ({many}) => ({
	secondarySalesItems: many(secondarySalesItems),
}));

export const zeptoPoLinesRelations = relations(zeptoPoLines, ({one}) => ({
	zeptoPoHeader: one(zeptoPoHeader, {
		fields: [zeptoPoLines.poHeaderId],
		references: [zeptoPoHeader.id]
	}),
}));

export const zeptoPoHeaderRelations = relations(zeptoPoHeader, ({many}) => ({
	zeptoPoLines: many(zeptoPoLines),
}));

export const poLinesRelations = relations(poLines, ({one}) => ({
	poMaster: one(poMaster, {
		fields: [poLines.poId],
		references: [poMaster.id]
	}),
}));

export const zomatoPoItemsRelations = relations(zomatoPoItems, ({one}) => ({
	zomatoPoHeader: one(zomatoPoHeader, {
		fields: [zomatoPoItems.poHeaderId],
		references: [zomatoPoHeader.id]
	}),
}));

export const zomatoPoHeaderRelations = relations(zomatoPoHeader, ({many}) => ({
	zomatoPoItems: many(zomatoPoItems),
}));

export const distributorOrderItemsRelations = relations(distributorOrderItems, ({one}) => ({
	distributorPo: one(distributorPo, {
		fields: [distributorOrderItems.poId],
		references: [distributorPo.id]
	}),
}));

export const distributorPoRelations = relations(distributorPo, ({many}) => ({
	distributorOrderItems: many(distributorOrderItems),
}));

export const bigbasketPoLinesRelations = relations(bigbasketPoLines, ({one}) => ({
	bigbasketPoHeader: one(bigbasketPoHeader, {
		fields: [bigbasketPoLines.poId],
		references: [bigbasketPoHeader.id]
	}),
}));

export const bigbasketPoHeaderRelations = relations(bigbasketPoHeader, ({many}) => ({
	bigbasketPoLines: many(bigbasketPoLines),
}));

export const platformProductCodesRelations = relations(platformProductCodes, ({one}) => ({
	platform: one(platforms, {
		fields: [platformProductCodes.platformId],
		references: [platforms.id]
	}),
}));

export const blinkitPoLinesRelations = relations(blinkitPoLines, ({one}) => ({
	blinkitPoHeader: one(blinkitPoHeader, {
		fields: [blinkitPoLines.headerId],
		references: [blinkitPoHeader.id]
	}),
}));

export const blinkitPoHeaderRelations = relations(blinkitPoHeader, ({many}) => ({
	blinkitPoLines: many(blinkitPoLines),
}));

export const swiggyPoLinesRelations = relations(swiggyPoLines, ({one}) => ({
	swiggyPo: one(swiggyPos, {
		fields: [swiggyPoLines.poId],
		references: [swiggyPos.id]
	}),
}));

export const swiggyPosRelations = relations(swiggyPos, ({many}) => ({
	swiggyPoLines: many(swiggyPoLines),
}));

export const masterPoLinesRelations = relations(masterPoLines, ({one}) => ({
	masterPoHeader: one(masterPoHeader, {
		fields: [masterPoLines.masterPoHeaderId],
		references: [masterPoHeader.id]
	}),
}));

export const masterPoHeaderRelations = relations(masterPoHeader, ({many}) => ({
	masterPoLines: many(masterPoLines),
}));

export const amazonPoLinesRelations = relations(amazonPoLines, ({one}) => ({
	amazonPoHeader: one(amazonPoHeader, {
		fields: [amazonPoLines.poNumber],
		references: [amazonPoHeader.poNumber]
	}),
}));

export const amazonPoHeaderRelations = relations(amazonPoHeader, ({many}) => ({
	amazonPoLines: many(amazonPoLines),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	users: many(users),
	rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const flipkartGroceryPoLinesRelations = relations(flipkartGroceryPoLines, ({one}) => ({
	flipkartGroceryPoHeader: one(flipkartGroceryPoHeader, {
		fields: [flipkartGroceryPoLines.headerId],
		references: [flipkartGroceryPoHeader.id]
	}),
}));

export const flipkartGroceryPoHeaderRelations = relations(flipkartGroceryPoHeader, ({many}) => ({
	flipkartGroceryPoLines: many(flipkartGroceryPoLines),
}));