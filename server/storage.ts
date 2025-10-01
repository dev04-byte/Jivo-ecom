import { 
  type User, 
  type InsertUser,
  type UpdateUser,
  type LogMaster,
  type InsertLogMaster,
  type PfMst,
  type InsertPfMst,
  type SapItemMst,
  type InsertSapItemMst,
  type SapItemMstApi,
  type InsertSapItemMstApi,
  type Items,
  type InsertItems,
  type PfItemMst,
  type InsertPfItemMst,
  type PfPo,
  type InsertPfPo,
  type PfOrderItems,
  type InsertPfOrderItems,
  type FlipkartGroceryPoHeader,
  type InsertFlipkartGroceryPoHeader,
  type FlipkartGroceryPoLines,
  type InsertFlipkartGroceryPoLines,
  type ZeptoPoHeader,
  type InsertZeptoPoHeader,
  type ZeptoPoLines,
  type InsertZeptoPoLines,
  type CityMallPoHeader,
  type InsertCityMallPoHeader,
  type CityMallPoLines,
  type InsertCityMallPoLines,
  type BlinkitPoHeader,
  type InsertBlinkitPoHeader,
  type BlinkitPoLines,
  type InsertBlinkitPoLines,
  type SwiggyPo,
  type SwiggyPoLine,
  type InsertSwiggyPo,
  type InsertSwiggyPoLine,
  type BigbasketPoHeader,
  type BigbasketPoLines,
  type InsertBigbasketPoHeader,
  type InsertBigbasketPoLines,
  type ZomatoPoHeader,
  type ZomatoPoItems,
  type InsertZomatoPoHeader,
  type InsertZomatoPoItems,
  type DealsharePoHeader,
  type DealsharePoItems,
  type InsertDealsharePoHeader,
  type InsertDealsharePoItems,
  type AmazonPoHeader,
  type AmazonPoLines,
  type InsertAmazonPoHeader,
  type InsertAmazonPoLines,
  type SecondarySalesHeader,
  type SecondarySalesItems,
  type InsertSecondarySalesHeader,
  type InsertSecondarySalesItems,
  type ScAmJwDaily,
  type InsertScAmJwDaily,
  type ScAmJwRange,
  type InsertScAmJwRange,
  type ScAmJmDaily,
  type InsertScAmJmDaily,
  type ScAmJmRange,
  type InsertScAmJmRange,
  type ZeptoSecondarySalesItem,
  type InsertZeptoSecondarySalesItem,
  type ZeptoSecondarySalesRangeItem,
  type InsertZeptoSecondarySalesRangeItem,
  type BlinkitSecondarySalesItem,
  type InsertBlinkitSecondarySalesItem,
  type BlinkitSecondarySalesRangeItem,
  type InsertBlinkitSecondarySalesRangeItem,
  type SwiggySecondarySalesItem,
  type InsertSwiggySecondarySalesItem,
  type SwiggySecondarySalesRangeItem,
  type InsertSwiggySecondarySalesRangeItem,
  type JioMartSaleSecondarySalesItem,
  type InsertJioMartSaleSecondarySalesItem,
  type JioMartSaleSecondarySalesRangeItem,
  type InsertJioMartSaleSecondarySalesRangeItem,
  type JioMartCancelSecondarySalesItem,
  type InsertJioMartCancelSecondarySalesItem,
  type JioMartCancelSecondarySalesRangeItem,
  type InsertJioMartCancelSecondarySalesRangeItem,
  type BigBasketSecondarySalesItem,
  type InsertBigBasketSecondarySalesItem,
  type BigBasketSecondarySalesRangeItem,
  type InsertBigBasketSecondarySalesRangeItem,

  type JioMartInventoryItem,
  type InsertJioMartInventoryItem,
  type JioMartInventoryRangeItem,
  type InsertJioMartInventoryRangeItem,
  type BlinkitInventoryItem,
  type InsertBlinkitInventoryItem,
  type SwiggyInventoryItem,
  type InsertSwiggyInventoryItem,
  type SwiggyInventoryRange,
  type InsertSwiggyInventoryRange,
  type FlipkartInventoryDaily,
  type InsertFlipkartInventoryDaily,
  type FlipkartInventoryRange,
  type InsertFlipkartInventoryRange,
  type ZeptoInventoryDaily,
  type InsertZeptoInventoryDaily,
  type ZeptoInventoryRange,
  type InsertZeptoInventoryRange,
  type BigBasketInventoryDaily,
  type InsertBigBasketInventoryDaily,
  type BigBasketInventoryRange,
  type InsertBigBasketInventoryRange,

  type DistributorMst,
  type InsertDistributorMst,
  type DistributorPo,
  type InsertDistributorPo,
  type DistributorOrderItems,
  type InsertDistributorOrderItems,
  users,
  logMaster,
  pfMst,
  sapItemMst,
  sapItemMstApi,
  pfItemMst,
  pfPo,
  pfOrderItems,
  flipkartGroceryPoHeader,
  flipkartGroceryPoLines,
  zeptoPoHeader,
  zeptoPoLines,
  cityMallPoHeader,
  cityMallPoLines,
  blinkitPoHeader,
  blinkitPoLines,
  swiggyPos,
  swiggyPoLines,
  bigbasketPoHeader,
  bigbasketPoLines,
  zomatoPoHeader,
  zomatoPoItems,
  dealsharePoHeader,
  dealsharePoLines,
  amazonPoHeader,
  amazonPoLines,
  secondarySalesHeader,
  secondarySalesItems,
  zeptoAttachments,
  zeptoComments,
  flipkartAttachments,
  flipkartComments,
  blinkitAttachments,
  blinkitComments,
  swiggyAttachments,
  swiggyComments,
  bigbasketAttachments,
  bigbasketComments,
  zomatoAttachments,
  zomatoComments,
  dealshareAttachments,
  dealshareComments,
  citymallAttachments,
  citymallComments,
  platformPoAttachments,
  platformPoComments,
  scAmJwDaily,
  scAmJwRange,
  scAmJmDaily,
  scAmJmRange,
  scZeptoJmDaily,
  scZeptoJmRange,
  scBlinkitJmDaily,
  scBlinkitJmRange,
  scSwiggyJmDaily,
  scSwiggyJmRange,
  scJioMartSaleJmDaily,
  scJioMartSaleJmRange,
  scJioMartCancelJmDaily,
  scJioMartCancelJmRange,
  scBigBasketJmDaily,
  scBigBasketJmRange,

  invJioMartJmDaily,
  invJioMartJmRange,
  invBlinkitJmDaily,
  invBlinkitJmRange,
  invAmazonJmDaily,
  invAmazonJmRange,
  invAmazonJwDaily,
  invAmazonJwRange,
  invSwiggyJmDaily,
  invSwiggyJmRange,
  invFlipkartJmDaily,
  invFlipkartJmRange,
  invZeptoJmDaily,
  invZeptoJmRange,
  invBigBasketJmDaily,
  invBigBasketJmRange,

  distributorMst,
  distributorPo,
  distributorOrderItems,
  
  poMaster,
  poLines,
  type PoMaster,
  type InsertPoMaster,
  type PoLines,
  type InsertPoLines,
  
  statesMst,
  districtsMst,
  regions,
  states,
  districts,
  distributors,
  type Regions,
  type InsertRegions,
  type StatesMst,
  type InsertStatesMst,
  type DistrictsMst,
  type InsertDistrictsMst,
  type States,
  type Districts,
  type Distributors,
  
  // Status tables
  statuses,
  statusItem,
  type Statuses,
  type StatusItem,
  
  // Items table
  items,
  
  // RBAC tables and types
  roles,
  permissions,
  rolePermissions,
  userSessions,
  type Role,
  type InsertRole,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type UserSession,
  type InsertUserSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, gte, lte, sql, inArray, isNotNull, ne } from "drizzle-orm";

export interface IStorage {
  // Enhanced user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User>;
  deleteUser(id: number): Promise<void>;
  updateLastLogin(id: number): Promise<void>;
  changePassword(id: number, hashedPassword: string): Promise<void>;

  // Platform methods
  getAllPlatforms(): Promise<PfMst[]>;
  createPlatform(platform: InsertPfMst): Promise<PfMst>;
  
  // SAP Item methods
  getAllSapItems(): Promise<SapItemMst[]>;
  createSapItem(item: InsertSapItemMst): Promise<SapItemMst>;
  
  // SAP Item API methods
  getAllSapItemsApi(): Promise<SapItemMstApi[]>;
  createSapItemApi(item: InsertSapItemMstApi): Promise<SapItemMstApi>;
  syncSapItemsFromApi(items: InsertSapItemMstApi[]): Promise<number>;
  
  // Platform Item methods
  getPlatformItems(platformId?: number, search?: string): Promise<(PfItemMst & { sapItem: SapItemMst; platform: PfMst })[]>;
  createPlatformItem(item: InsertPfItemMst): Promise<PfItemMst>;
  
  // PO methods
  getAllPos(): Promise<(Omit<PfPo, 'platform'> & { platform: PfMst; orderItems: PfOrderItems[] })[]>;
  getPoById(id: number): Promise<(Omit<PfPo, 'platform'> & { platform: PfMst; orderItems: PfOrderItems[] }) | undefined>;
  getRawPoData(id: number): Promise<any>; // DEBUG: Get raw database data
  createPo(po: InsertPfPo, items: InsertPfOrderItems[]): Promise<PfPo>;
  updatePo(id: number, po: Partial<InsertPfPo>, items?: InsertPfOrderItems[]): Promise<PfPo>;
  deletePo(id: number): Promise<void>;
  
  // Order Items methods
  getAllOrderItems(): Promise<(PfOrderItems & { po_number: string; platform_name: string; order_date: Date; expiry_date: Date | null; platform: PfMst })[]>;
  updateOrderItemStatus(id: number, status: string): Promise<PfOrderItems>;
  
  // Status methods
  getAllStatuses(): Promise<Statuses[]>;
  getAllStatusItems(): Promise<StatusItem[]>;
  
  // Items methods
  getAllItems(): Promise<any[]>;
  searchItems(query: string): Promise<any[]>;
  getItemByCode(itemcode: string): Promise<any | undefined>;
  getItemByName(itemname: string): Promise<any | undefined>;
  createItem(item: InsertItems): Promise<Items>;
  updateItem(itemcode: string, item: Partial<InsertItems>): Promise<Items>;
  syncItemsFromHana(hanaItems: any[]): Promise<number>;
  createPFItem(data: { pf_id: number; pf_itemcode: string; pf_itemname: string; sap_id: string }): Promise<any>;
  checkPFItemDuplicates(data: { pf_id: number; pf_itemcode: string; pf_itemname: string }): Promise<{ codeExists: boolean; nameExists: boolean; }>;
  searchPFItems(searchTerm: string): Promise<any[]>;
  getUniqueDispatchLocations(): Promise<string[]>;
  
  // Generic PO Master and Lines methods
  getAllPoMasters(): Promise<(PoMaster & { platform: PfMst; poLines: PoLines[] })[]>;
  getPoMasterById(id: number): Promise<(PoMaster & { platform: PfMst; poLines: PoLines[]; state?: any; district?: any; distributor?: any }) | undefined>;
  getPoMasterByNumber(poNumber: string): Promise<PoMaster | undefined>;
  createPoMaster(master: InsertPoMaster, lines: InsertPoLines[]): Promise<PoMaster>;
  updatePoMaster(id: number, master: Partial<InsertPoMaster>, lines?: InsertPoLines[]): Promise<PoMaster>;
  deletePoMaster(id: number): Promise<void>;

  // Flipkart Grocery PO methods
  getAllFlipkartGroceryPos(): Promise<(FlipkartGroceryPoHeader & { poLines: FlipkartGroceryPoLines[] })[]>;
  getFlipkartGroceryPoById(id: number): Promise<(FlipkartGroceryPoHeader & { poLines: FlipkartGroceryPoLines[] }) | undefined>;
  getFlipkartGroceryPoByNumber(poNumber: string): Promise<FlipkartGroceryPoHeader | undefined>;
  createFlipkartGroceryPo(header: InsertFlipkartGroceryPoHeader, lines: InsertFlipkartGroceryPoLines[]): Promise<FlipkartGroceryPoHeader>;
  updateFlipkartGroceryPo(id: number, header: Partial<InsertFlipkartGroceryPoHeader>, lines?: InsertFlipkartGroceryPoLines[]): Promise<FlipkartGroceryPoHeader>;
  deleteFlipkartGroceryPo(id: number): Promise<void>;
  getFlipkartGroceryPoLines(poHeaderId: number): Promise<FlipkartGroceryPoLines[]>;

  // Zepto PO methods
  getAllZeptoPos(): Promise<(ZeptoPoHeader & { poLines: ZeptoPoLines[] })[]>;
  getZeptoPOById(id: number): Promise<(ZeptoPoHeader & { poLines: ZeptoPoLines[] }) | undefined>;
  getZeptoPoByNumber(poNumber: string): Promise<ZeptoPoHeader | undefined>;
  createZeptoPo(header: InsertZeptoPoHeader, lines: InsertZeptoPoLines[]): Promise<ZeptoPoHeader>;
  updateZeptoPo(id: number, header: Partial<InsertZeptoPoHeader>, lines?: InsertZeptoPoLines[]): Promise<ZeptoPoHeader>;
  deleteZeptoPo(id: number): Promise<void>;

  // City Mall PO methods
  getAllCityMallPos(): Promise<(CityMallPoHeader & { poLines: CityMallPoLines[] })[]>;
  getCityMallPoById(id: number): Promise<(CityMallPoHeader & { poLines: CityMallPoLines[] }) | undefined>;
  getCityMallPoByNumber(poNumber: string): Promise<CityMallPoHeader | undefined>;
  createCityMallPo(header: InsertCityMallPoHeader, lines: InsertCityMallPoLines[]): Promise<CityMallPoHeader>;
  updateCityMallPo(id: number, header: Partial<InsertCityMallPoHeader>, lines?: InsertCityMallPoLines[]): Promise<CityMallPoHeader>;
  deleteCityMallPo(id: number): Promise<void>;

  // Blinkit PO methods
  getAllBlinkitPos(): Promise<(BlinkitPoHeader & { poLines: BlinkitPoLines[] })[]>;
  getBlinkitPoById(id: number): Promise<(BlinkitPoHeader & { poLines: BlinkitPoLines[] }) | undefined>;
  getBlinkitPoByNumber(poNumber: string): Promise<BlinkitPoHeader | undefined>;
  createBlinkitPo(header: InsertBlinkitPoHeader, lines: InsertBlinkitPoLines[]): Promise<BlinkitPoHeader>;
  updateBlinkitPo(id: number, header: Partial<InsertBlinkitPoHeader>, lines?: InsertBlinkitPoLines[]): Promise<BlinkitPoHeader>;
  deleteBlinkitPo(id: number): Promise<void>;

  // Swiggy PO methods
  getAllSwiggyPos(): Promise<(SwiggyPo & { poLines: SwiggyPoLine[] })[]>;
  getSwiggyPoById(id: number): Promise<(SwiggyPo & { poLines: SwiggyPoLine[] }) | undefined>;
  getSwiggyPoByNumber(poNumber: string): Promise<SwiggyPo | undefined>;
  createSwiggyPo(po: InsertSwiggyPo, lines: InsertSwiggyPoLine[]): Promise<SwiggyPo>;
  updateSwiggyPo(id: number, po: Partial<InsertSwiggyPo>): Promise<SwiggyPo | undefined>;
  deleteSwiggyPo(id: number): Promise<void>;

  // Distributor methods
  getAllDistributors(): Promise<DistributorMst[]>;
  getDistributorById(id: number): Promise<DistributorMst | undefined>;
  getDistributorByName(name: string): Promise<DistributorMst | undefined>;
  createDistributor(distributor: InsertDistributorMst): Promise<DistributorMst>;
  updateDistributor(id: number, distributor: Partial<InsertDistributorMst>): Promise<DistributorMst>;
  deleteDistributor(id: number): Promise<void>;

  // State and District methods for dynamic dropdowns (using original tables)
  getAllStates(): Promise<States[]>;
  getDistrictsByStateId(stateId: number): Promise<Districts[]>;
  getAllDistributorsFromOriginalTable(): Promise<Distributors[]>;
  
  // Three-level cascading dropdown methods (regions → states → districts)
  getAllRegions(): Promise<{ id: number; region_name: string }[]>;
  getStatesByRegion(regionId: number): Promise<{ id: number; state_name: string; region_id: number }[]>;
  getDistrictsByStateIdFromMaster(stateId: number): Promise<{ id: number; district_name: string; state_id: number }[]>;

  // Distributor PO methods
  getAllDistributorPos(): Promise<(Omit<DistributorPo, 'distributor_id'> & { distributor: DistributorMst; orderItems: DistributorOrderItems[] })[]>;
  getDistributorPoById(id: number): Promise<(Omit<DistributorPo, 'distributor_id'> & { distributor: DistributorMst; orderItems: DistributorOrderItems[] }) | undefined>;
  createDistributorPo(po: InsertDistributorPo, items: InsertDistributorOrderItems[]): Promise<DistributorPo>;
  updateDistributorPo(id: number, po: Partial<InsertDistributorPo>, items?: InsertDistributorOrderItems[]): Promise<DistributorPo>;
  deleteDistributorPo(id: number): Promise<void>;

  // Distributor Order Items methods
  getAllDistributorOrderItems(): Promise<(DistributorOrderItems & { po_number: string; distributor_name: string; order_date: Date; expiry_date: Date | null; distributor: DistributorMst })[]>;
  updateDistributorOrderItemStatus(itemId: number, status: string): Promise<void>;

  // BigBasket PO methods
  getAllBigbasketPos(): Promise<(BigbasketPoHeader & { poLines: BigbasketPoLines[] })[]>;
  getBigbasketPoById(id: number): Promise<(BigbasketPoHeader & { poLines: BigbasketPoLines[] }) | undefined>;
  getBigbasketPoByNumber(poNumber: string): Promise<BigbasketPoHeader | undefined>;
  createBigbasketPo(header: InsertBigbasketPoHeader, lines: InsertBigbasketPoLines[]): Promise<BigbasketPoHeader>;
  updateBigbasketPo(id: number, header: Partial<InsertBigbasketPoHeader>, lines?: InsertBigbasketPoLines[]): Promise<BigbasketPoHeader>;
  deleteBigbasketPo(id: number): Promise<void>;

  // Zomato PO methods
  getAllZomatoPos(): Promise<(ZomatoPoHeader & { poItems: ZomatoPoItems[] })[]>;
  getZomatoPoById(id: number): Promise<(ZomatoPoHeader & { poItems: ZomatoPoItems[] }) | undefined>;
  getZomatoPoByNumber(poNumber: string): Promise<ZomatoPoHeader | undefined>;
  createZomatoPo(header: InsertZomatoPoHeader, items: InsertZomatoPoItems[]): Promise<ZomatoPoHeader>;
  updateZomatoPo(id: number, header: Partial<InsertZomatoPoHeader>, items?: InsertZomatoPoItems[]): Promise<ZomatoPoHeader>;
  deleteZomatoPo(id: number): Promise<void>;

  // Amazon PO methods
  getAllAmazonPos(): Promise<(AmazonPoHeader & { poLines: AmazonPoLines[] })[]>;
  getAmazonPoById(id: number): Promise<(AmazonPoHeader & { poLines: AmazonPoLines[] }) | undefined>;
  getAmazonPoByNumber(poNumber: string): Promise<AmazonPoHeader | undefined>;
  createAmazonPo(header: InsertAmazonPoHeader, items: InsertAmazonPoLines[]): Promise<AmazonPoHeader>;
  updateAmazonPo(id: number, header: Partial<InsertAmazonPoHeader>, items?: InsertAmazonPoLines[]): Promise<AmazonPoHeader>;
  deleteAmazonPo(id: number): Promise<void>;

  // Secondary Sales methods
  getAllSecondarySales(platform?: string, businessUnit?: string): Promise<(SecondarySalesHeader & { salesItems: SecondarySalesItems[] })[]>;
  getSecondarySalesById(id: number): Promise<(SecondarySalesHeader & { salesItems: SecondarySalesItems[] }) | undefined>;
  createSecondarySales(header: InsertSecondarySalesHeader, items: InsertSecondarySalesItems[]): Promise<SecondarySalesHeader>;
  updateSecondarySales(id: number, header: Partial<InsertSecondarySalesHeader>, items?: InsertSecondarySalesItems[]): Promise<SecondarySalesHeader>;
  deleteSecondarySales(id: number): Promise<void>;

  // Specific Secondary Sales table methods
  createScAmJwDaily(items: InsertScAmJwDaily[]): Promise<ScAmJwDaily[]>;
  createScAmJwRange(items: InsertScAmJwRange[]): Promise<ScAmJwRange[]>;
  createScAmJmDaily(items: InsertScAmJmDaily[]): Promise<ScAmJmDaily[]>;
  createScAmJmRange(items: InsertScAmJmRange[]): Promise<ScAmJmRange[]>;
  
  // New secondary sales platforms
  createScZeptoJmDaily(items: InsertZeptoSecondarySalesItem[]): Promise<ZeptoSecondarySalesItem[]>;
  createScZeptoJmRange(items: InsertZeptoSecondarySalesRangeItem[]): Promise<ZeptoSecondarySalesRangeItem[]>;
  createScBlinkitJmDaily(items: InsertBlinkitSecondarySalesItem[]): Promise<BlinkitSecondarySalesItem[]>;
  createScBlinkitJmRange(items: InsertBlinkitSecondarySalesRangeItem[]): Promise<BlinkitSecondarySalesRangeItem[]>;
  createScSwiggyJmDaily(items: InsertSwiggySecondarySalesItem[]): Promise<SwiggySecondarySalesItem[]>;
  createScSwiggyJmRange(items: InsertSwiggySecondarySalesRangeItem[]): Promise<SwiggySecondarySalesRangeItem[]>;
  createScJioMartSaleJmDaily(items: InsertJioMartSaleSecondarySalesItem[]): Promise<JioMartSaleSecondarySalesItem[]>;
  createScJioMartSaleJmRange(items: InsertJioMartSaleSecondarySalesRangeItem[]): Promise<JioMartSaleSecondarySalesRangeItem[]>;
  createScJioMartCancelJmDaily(items: InsertJioMartCancelSecondarySalesItem[]): Promise<JioMartCancelSecondarySalesItem[]>;
  createScJioMartCancelJmRange(items: InsertJioMartCancelSecondarySalesRangeItem[]): Promise<JioMartCancelSecondarySalesRangeItem[]>;
  createScBigBasketJmDaily(items: InsertBigBasketSecondarySalesItem[]): Promise<BigBasketSecondarySalesItem[]>;
  createScBigBasketJmRange(items: InsertBigBasketSecondarySalesRangeItem[]): Promise<BigBasketSecondarySalesRangeItem[]>;
  getScAmJwDaily(dateStart?: string, dateEnd?: string): Promise<ScAmJwDaily[]>;
  getScAmJwRange(dateStart?: string, dateEnd?: string): Promise<ScAmJwRange[]>;
  getScAmJmDaily(dateStart?: string, dateEnd?: string): Promise<ScAmJmDaily[]>;
  getScAmJmRange(dateStart?: string, dateEnd?: string): Promise<ScAmJmRange[]>;

  // Inventory Management methods
  getAllInventory(platform?: string, businessUnit?: string): Promise<any[]>;
  getInventoryById(id: number): Promise<any>;
  createInventoryJioMartJmDaily(items: InsertJioMartInventoryItem[]): Promise<JioMartInventoryItem[]>;
  createInventoryJioMartJmRange(items: InsertJioMartInventoryRangeItem[]): Promise<JioMartInventoryRangeItem[]>;
  updateInventory(id: number, header: any, items: any): Promise<any>;
  deleteInventory(id: number): Promise<void>;

  // Logging methods
  createLog(logData: InsertLogMaster): Promise<LogMaster>;
  logEdit(params: {
    username: string;
    action: string;
    tableName: string;
    recordId: number;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void>;
  
  // RBAC methods
  // Role management
  getAllRoles(): Promise<Role[]>;
  getRoleById(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  
  // Permission management
  getAllPermissions(): Promise<Permission[]>;
  getPermissionsByCategory(category: string): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: number): Promise<void>;
  
  // Role-Permission management
  getRolePermissions(roleId: number): Promise<RolePermission[]>;
  assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
  getUserPermissions(userId: number): Promise<Permission[]>;
  
  // User management with roles
  getAllUsers(): Promise<User[]>;
  assignRoleToUser(userId: number, roleId: number): Promise<User>;
  getUserWithRole(userId: number): Promise<(User & { role?: Role }) | undefined>;
  getUsersByRole(roleId: number): Promise<User[]>;
  
  // Session management
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  deleteUserSession(sessionToken: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  
  sessionStore: session.Store;
}

import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPgSimple(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  // Helper method to map status ID to status name
  private mapStatusIdToName(statusId: number): string {
    const statusMap: Record<number, string> = {
      1: 'OPEN',
      2: 'PENDING',
      3: 'IN_PROGRESS',
      4: 'COMPLETED',
      5: 'CLOSED',
      6: 'CANCELLED'
    };
    return statusMap[statusId] || 'OPEN';
  }

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool as any,
      createTableIfMissing: true,
      // Session store configuration for better timeout handling
      pruneSessionInterval: 60 * 15, // Prune sessions every 15 minutes
      tableName: 'session', // Explicit table name
      errorLog: (err) => {
        // Log session store errors but don't crash the app
        console.warn('Session store warning:', err.message);
      },
    });
  }
  // Enhanced user methods with session store
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, id));
  }

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ last_login: new Date() })
      .where(eq(users.id, id));
  }

  async changePassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: hashedPassword, 
        password_changed_at: new Date(),
        updated_at: new Date()
      })
      .where(eq(users.id, id));
  }

  // Platform methods
  async getAllPlatforms(): Promise<PfMst[]> {
    return await db.select().from(pfMst);
  }

  async createPlatform(platform: InsertPfMst): Promise<PfMst> {
    const [result] = await db.insert(pfMst).values(platform).returning();
    return result;
  }

  // SAP Item methods
  async getAllSapItems(): Promise<SapItemMst[]> {
    return await db.select().from(sapItemMst);
  }

  async createSapItem(item: InsertSapItemMst): Promise<SapItemMst> {
    const [result] = await db.insert(sapItemMst).values(item).returning();
    return result;
  }

  // SAP Item API methods
  async getAllSapItemsApi(): Promise<SapItemMstApi[]> {
    return await db.select().from(sapItemMstApi);
  }

  async createSapItemApi(item: InsertSapItemMstApi): Promise<SapItemMstApi> {
    const [result] = await db.insert(sapItemMstApi).values(item).returning();
    return result;
  }

  async syncSapItemsFromApi(items: InsertSapItemMstApi[]): Promise<number> {
    if (items.length === 0) return 0;
    
    // Clear existing data and insert new data
    await db.delete(sapItemMstApi);
    await db.insert(sapItemMstApi).values(items);
    
    return items.length;
  }

  // Platform Item methods
  async getPlatformItems(platformId?: number, search?: string): Promise<(PfItemMst & { sapItem: SapItemMst; platform: PfMst })[]> {
    let query = db
      .select({
        id: pfItemMst.id,
        pf_itemcode: pfItemMst.pf_itemcode,
        pf_itemname: pfItemMst.pf_itemname,
        pf_id: pfItemMst.pf_id,
        sap_id: pfItemMst.sap_id,
        sapItem: sapItemMst,
        platform: pfMst
      })
      .from(pfItemMst)
      .leftJoin(sapItemMst, eq(pfItemMst.sap_id, sapItemMst.id))
      .leftJoin(pfMst, eq(pfItemMst.pf_id, pfMst.id));

    const conditions = [];
    
    if (platformId) {
      conditions.push(eq(pfItemMst.pf_id, platformId));
    }
    
    if (search) {
      conditions.push(ilike(pfItemMst.pf_itemname, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query;
    return results.map(row => ({
      id: row.id,
      pf_itemcode: row.pf_itemcode,
      pf_itemname: row.pf_itemname,
      pf_id: row.pf_id,
      sap_id: row.sap_id,
      sapItem: row.sapItem!,
      platform: row.platform!
    }));
  }

  async createPlatformItem(item: InsertPfItemMst): Promise<PfItemMst> {
    const [result] = await db.insert(pfItemMst).values(item).returning();
    return result;
  }

  // PO methods
  async getAllPos(): Promise<(Omit<PfPo, 'platform'> & { platform: PfMst; orderItems: PfOrderItems[] })[]> {
    const result = [];

    console.log(`📊 getAllPos: Starting with platform-specific data first (showing original data - including BigBasket)`);

    // PRIORITY 1: Fetch platform-specific POs first (original data)
    // This ensures we show exact data from each platform's tables

    // Fetch Zepto POs from zepto_po_header (original Zepto data)
    try {
      const zeptoPos = await this.getAllZeptoPos();
      console.log(`📊 getAllPos: Found ${zeptoPos.length} Zepto POs from zepto_po_header (original data)`);

      for (const zeptoPo of zeptoPos) {
        // Use original Zepto data exactly as uploaded
        const originalZeptoPo = {
          id: zeptoPo.id,
          po_number: zeptoPo.po_number,
          po_date: zeptoPo.po_date,
          platform: { id: 3, pf_name: "Zepto" },
          status: zeptoPo.status || 'Active',
          created_at: zeptoPo.created_at,
          updated_at: zeptoPo.updated_at,
          order_date: zeptoPo.po_date,
          expiry_date: zeptoPo.po_expiry_date,
          city: zeptoPo.city || '',
          state: zeptoPo.state || '',
          serving_distributor: zeptoPo.vendor_name || '',
          // Original Zepto line items with exact field names
          orderItems: zeptoPo.poLines.map(line => ({
            id: line.id,
            po_id: zeptoPo.id,
            item_code: line.vendor_item_code || '',
            item_name: line.item_name,
            quantity: line.quantity || 0,
            basic_rate: line.basic_rate?.toString() || '0',
            landing_rate: line.landing_rate?.toString() || '0',
            status: line.status || 'Pending',
            platform_code: line.vendor_item_code || '',
            sap_code: line.vendor_item_code || '',
            uom: line.uom || 'PCS',
            gst_rate: line.gst_rate?.toString() || '0'
          }))
        };

        result.push(originalZeptoPo as any);
      }
    } catch (error) {
      console.error('Error fetching Zepto POs from zepto_po_header:', error);
    }

    // Fetch Blinkit POs from blinkit_po_header (original Blinkit data)
    try {
      const blinkitPos = await this.getAllBlinkitPos();
      console.log(`📊 getAllPos: Found ${blinkitPos.length} Blinkit POs from blinkit_po_header (original data)`);

      for (const blinkitPo of blinkitPos) {
        // Use original Blinkit data exactly as uploaded
        const originalBlinkitPo = {
          id: blinkitPo.id,
          po_number: blinkitPo.po_number,
          po_date: blinkitPo.po_date,
          platform: { id: 1, pf_name: "Blinkit" },
          total_amount: blinkitPo.total_amount || '0',
          vendor_name: blinkitPo.vendor_name || '',
          buyer_name: blinkitPo.buyer_name || '',
          status: 'Active',
          created_at: blinkitPo.created_at,
          updated_at: blinkitPo.updated_at,
          order_date: blinkitPo.po_date,
          // Original Blinkit line items with exact field names
          orderItems: blinkitPo.poLines.map(line => ({
            id: line.id,
            po_id: blinkitPo.id,
            item_code: line.item_code,
            item_name: line.product_description,
            product_description: line.product_description,
            quantity: line.quantity,
            basic_rate: line.basic_cost_price?.toString() || '0',
            landing_rate: line.landing_rate?.toString() || '0',
            total_amount: line.total_amount?.toString() || '0',
            hsn_code: line.hsn_code,
            tax_amount: line.tax_amount?.toString() || '0',
            mrp: line.mrp?.toString() || '0',
            platform_code: line.item_code,
            sap_code: line.item_code,
            uom: 'PCS'
          }))
        };

        result.push(originalBlinkitPo as any);
      }
    } catch (error) {
      console.error('Error fetching Blinkit POs from blinkit_po_header:', error);
    }

    // Fetch Swiggy POs from swiggy_pos (original Swiggy data)
    try {
      const swiggyPos = await this.getAllSwiggyPos();
      console.log(`📊 getAllPos: Found ${swiggyPos.length} Swiggy POs from swiggy_pos (original data)`);

      for (const swiggyPo of swiggyPos) {
        // Use original Swiggy data exactly as uploaded
        const originalSwiggyPo = {
          id: swiggyPo.id,
          po_number: swiggyPo.po_number,
          po_date: swiggyPo.po_date,
          platform: { id: 4, pf_name: "Swiggy" },
          vendor_name: swiggyPo.vendor_name || '',
          status: swiggyPo.status || 'Active',
          created_at: swiggyPo.created_at,
          updated_at: swiggyPo.updated_at,
          order_date: swiggyPo.po_date,
          expiry_date: swiggyPo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: swiggyPo.vendor_name || '',
          // Original Swiggy line items with exact field names
          orderItems: swiggyPo.poLines.map(line => ({
            id: line.id,
            po_id: swiggyPo.id,
            item_code: line.item_code,
            item_name: line.item_description,
            product_description: line.item_description,
            quantity: line.quantity,
            basic_rate: line.unit_base_cost?.toString() || '0',
            landing_rate: line.unit_base_cost?.toString() || '0',
            total_amount: line.line_total?.toString() || '0',
            hsn_code: line.hsn_code,
            tax_amount: line.total_tax_amount?.toString() || '0',
            mrp: line.mrp?.toString() || '0',
            platform_code: line.item_code,
            sap_code: line.item_code,
            uom: 'PCS'
          }))
        };

        result.push(originalSwiggyPo as any);
      }
    } catch (error) {
      console.error('Error fetching Swiggy POs from swiggy_pos:', error);
    }

    // Fetch Flipkart Grocery POs from flipkart_grocery_po_header (original Flipkart data)
    try {
      const flipkartPos = await this.getAllFlipkartGroceryPos();
      console.log(`📊 getAllPos: Found ${flipkartPos.length} Flipkart Grocery POs from flipkart_grocery_po_header (original data)`);

      for (const flipkartPo of flipkartPos) {
        // DEBUG: Check what fields are available
        console.log(`🔍 DEBUG Flipkart PO ${flipkartPo.po_number}:`, {
          order_date: flipkartPo.order_date,
          created_at: flipkartPo.created_at,
          po_expiry_date: flipkartPo.po_expiry_date,
          available_fields: Object.keys(flipkartPo)
        });

        // Use original Flipkart data exactly as uploaded
        const originalFlipkartPo = {
          id: flipkartPo.id,
          po_number: flipkartPo.po_number,
          po_date: flipkartPo.order_date || flipkartPo.created_at, // Flipkart uses order_date but fallback to created_at
          order_date: flipkartPo.order_date || flipkartPo.created_at, // Frontend expects order_date
          expiry_date: flipkartPo.expiry_date || null,
          city: flipkartPo.location || '',
          state: flipkartPo.state || '',
          serving_distributor: flipkartPo.supplier_name || '',
          platform: { id: 5, pf_name: "Flipkart" },
          vendor_name: flipkartPo.supplier_name || '',
          status: flipkartPo.status || 'Active',
          total_amount: flipkartPo.total_amount || '0',
          created_at: flipkartPo.created_at,
          updated_at: flipkartPo.updated_at,
          vendor_po_number: flipkartPo.po_number,
          bill_amount: flipkartPo.total_amount || '0',
          orderItems: flipkartPo.poLines.map((line, index) => ({
            id: line.id,
            po_id: flipkartPo.id,
            platform_id: 5,
            product_id: null,
            item_code: line.fsn_isbn || '',
            item_name: line.title || '',
            item_description: line.title || '',
            sap_code: line.fsn_isbn || '',
            quantity: Number(line.quantity) || 0,
            basic_rate: String(Number(line.supplier_price) || 0),
            gst_rate: '0',
            landing_rate: String(Number(line.supplier_price) || 0),
            rate: Number(line.supplier_price) || 0,
            amount: Number(line.total_amount) || 0,
            create_on: flipkartPo.created_at,
            create_by: flipkartPo.created_by || 'system',
            modify_on: flipkartPo.updated_at,
            modify_by: flipkartPo.created_by || 'system',
            uom: line.uom || 'PCS'
          }))
        };

        result.push(originalFlipkartPo as any);
      }
    } catch (error) {
      console.error('Error fetching Flipkart Grocery POs from flipkart_grocery_po_header:', error);
    }

    // Fetch BigBasket POs from bigbasket_po_header (original BigBasket data)
    try {
      const bigbasketPos = await this.getAllBigbasketPos();
      console.log(`📊 getAllPos: Found ${bigbasketPos.length} BigBasket POs from bigbasket_po_header (original data)`);

      for (const bigbasketPo of bigbasketPos) {
        // Use original BigBasket data exactly as uploaded
        const originalBigBasketPo = {
          id: 12000000 + bigbasketPo.id, // BigBasket IDs start from 12000000 to avoid conflicts
          po_number: bigbasketPo.po_number,
          po_date: bigbasketPo.po_date,
          platform: { id: 12, pf_name: "BigBasket" },
          vendor_name: bigbasketPo.supplier_name || '',
          status: bigbasketPo.status || 'pending',
          created_at: bigbasketPo.created_at,
          updated_at: bigbasketPo.updated_at,
          order_date: bigbasketPo.po_date,
          expiry_date: bigbasketPo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: bigbasketPo.supplier_name || '',
          vendor_po_number: bigbasketPo.po_number,
          bill_amount: bigbasketPo.grand_total || '0',
          total_amount: bigbasketPo.grand_total || '0',
          orderItems: bigbasketPo.poLines ? bigbasketPo.poLines.map((line: any, index: number) => ({
            id: line.id || (2000000 + bigbasketPo.id * 100 + index), // Generate unique ID
            po_id: bigbasketPo.id,
            platform_id: 12,
            product_id: null,
            item_code: line.sku_code || '',
            item_name: line.description || '',
            item_description: line.description || '',
            sap_code: line.sku_code || '',
            quantity: parseInt(line.quantity || '0'),
            basic_rate: line.basic_cost || '0',
            gst_rate: line.gst_percent || '0',
            landing_rate: line.landing_cost || line.basic_cost || '0',
            rate: parseFloat(line.basic_cost || '0'),
            amount: parseFloat(line.total_value || '0'),
            create_on: bigbasketPo.created_at,
            create_by: bigbasketPo.created_by || 'system',
            modify_on: bigbasketPo.updated_at || bigbasketPo.created_at,
            modify_by: bigbasketPo.created_by || 'system',
            uom: 'pcs'
          })) : []
        };

        result.push(originalBigBasketPo as any);
      }
    } catch (error) {
      console.error('❌ getAllPos: Error fetching BigBasket POs:', error);
    }

    // Fetch CityMall POs from city_mall_po_header (original CityMall data)
    try {
      const cityMallPos = await this.getAllCityMallPos();
      console.log(`📊 getAllPos: Found ${cityMallPos.length} CityMall POs from city_mall_po_header (original data)`);

      for (const cityMallPo of cityMallPos) {
        // Use original CityMall data exactly as uploaded
        const originalCityMallPo = {
          id: 7000000 + cityMallPo.id, // CityMall IDs start from 7000000 to avoid conflicts
          po_number: cityMallPo.po_number,
          po_date: cityMallPo.po_date,
          platform: { id: 7, pf_name: "CityMall" },
          vendor_name: cityMallPo.vendor_name || '',
          status: cityMallPo.status || 'pending',
          created_at: cityMallPo.created_at,
          updated_at: cityMallPo.updated_at,
          order_date: cityMallPo.po_date,
          expiry_date: cityMallPo.po_expiry_date,
          city: '',
          state: '',
          region: '',
          area: '',
          buyer_name: 'CityMall',
          total_amount: cityMallPo.total_amount ? parseFloat(cityMallPo.total_amount.toString()) : 0,
          total_quantity: cityMallPo.total_quantity || 0,
          total_items: cityMallPo.poLines?.length || 0,
          orderItems: cityMallPo.poLines?.map((line, index) => ({
            id: line.id || index,
            po_id: cityMallPo.id,
            pf_itemcode: line.article_id || '',
            quantity: line.quantity || 0,
            cost_price: line.base_cost_price ? parseFloat(line.base_cost_price.toString()) : 0,
            mrp: line.mrp ? parseFloat(line.mrp.toString()) : 0,
            po_line_number: line.line_number || index + 1,
            product_description: line.article_name || '',
            hsn_code: line.hsn_code || '',
            total_cost: line.total_amount ? parseFloat(line.total_amount.toString()) : 0,
            igst_percent: line.igst_percent ? parseFloat(line.igst_percent.toString()) : 0,
            cess_percent: line.cess_percent ? parseFloat(line.cess_percent.toString()) : 0,
            igst_amount: line.igst_amount ? parseFloat(line.igst_amount.toString()) : 0,
            cess_amount: line.cess_amount ? parseFloat(line.cess_amount.toString()) : 0
          })) || []
        };

        result.push(originalCityMallPo as any);
      }
    } catch (error) {
      console.error('❌ getAllPos: Error fetching CityMall POs:', error);
    }

    // Fetch Dealshare POs from dealshare_po_header (original Dealshare data)
    try {
      const dealsharePos = await this.getAllDealsharePos();
      console.log(`📊 getAllPos: Found ${dealsharePos.length} Dealshare POs from dealshare_po_header (original data)`);

      for (const dealsharePo of dealsharePos) {
        // Use original Dealshare data exactly as uploaded
        const originalDealsharePo = {
          id: 8000000 + dealsharePo.id, // Dealshare IDs start from 8000000 to avoid conflicts
          po_number: dealsharePo.po_number,
          po_date: dealsharePo.po_created_date,
          platform: { id: 8, pf_name: "Dealshare" },
          vendor_name: dealsharePo.shipped_by || '',
          status: 'Active',
          created_at: dealsharePo.created_at,
          updated_at: dealsharePo.updated_at,
          order_date: dealsharePo.po_created_date,
          expiry_date: dealsharePo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: dealsharePo.shipped_by || '',
          vendor_po_number: dealsharePo.po_number,
          bill_amount: dealsharePo.total_gross_amount || '0',
          total_amount: dealsharePo.total_gross_amount || '0',
          total_quantity: dealsharePo.total_quantity || '0',
          total_items: dealsharePo.total_items || 0,
          orderItems: dealsharePo.poItems?.map((line, index) => ({
            id: line.id || (3000000 + dealsharePo.id * 100 + index), // Generate unique ID
            po_id: dealsharePo.id,
            platform_id: 8,
            product_id: null,
            item_code: line.sku || '',
            item_name: line.product_name || '',
            item_description: line.product_name || '',
            sap_code: line.sku || '',
            quantity: line.quantity || 0,
            basic_rate: line.buying_price?.toString() || '0',
            landing_rate: line.buying_price?.toString() || '0',
            status: 'Pending',
            platform_code: line.sku || '',
            uom: 'PCS',
            gst_rate: line.gst_percent?.toString() || '0',
            total_amount: line.gross_amount?.toString() || '0',
            hsn_code: line.hsn_code || '',
            mrp: line.mrp_tax_inclusive?.toString() || '0',
            cost_price: parseFloat(line.buying_price?.toString() || '0'),
            po_line_number: line.line_number || index + 1
          })) || []
        };

        result.push(originalDealsharePo as any);
      }
    } catch (error) {
      console.error('❌ getAllPos: Error fetching Dealshare POs:', error);
    }

    // Fetch Zomato POs from zomato_po_header (original Zomato data)
    try {
      const zomatoPos = await this.getAllZomatoPos();
      console.log(`📊 getAllPos: Found ${zomatoPos.length} Zomato POs from zomato_po_header (original data)`);

      for (const zomatoPo of zomatoPos) {
        // Calculate total amount from po items
        const totalAmount = zomatoPo.poItems?.reduce((sum, item) => {
          const itemTotal = parseFloat(item.total_amount?.toString() || '0');
          return sum + itemTotal;
        }, 0) || parseFloat(zomatoPo.grand_total?.toString() || '0');

        // Calculate the unified ID first
        const unifiedId = 9000000 + zomatoPo.id;

        // Map order items first
        const orderItems = zomatoPo.poItems?.map((line: any, index: number) => ({
          id: line.id,
          po_id: unifiedId, // Use the pre-calculated ID
          item_name: line.product_name || '',
          sap_code: line.product_number || '',
          quantity: parseInt(line.quantity_ordered?.toString() || '1', 10),
          basic_rate: line.price_per_unit?.toString() || '0',
          gst_rate: line.gst_rate?.toString() || '0',
          landing_rate: line.total_amount?.toString() || line.line_total?.toString() || '0',
          status: 'active',
          create_on: line.created_at || new Date(),
          create_by: 'zomato',
          modify_on: line.updated_at || line.created_at || new Date(),
          modify_by: 'zomato',
          hsn_code: line.hsn_code || '',
          mrp: '0',
          cost_price: parseFloat(line.price_per_unit?.toString() || '0'),
          po_line_number: line.line_number || index + 1
        })) || [];

        // Use original Zomato data exactly as uploaded
        const originalZomatoPo = {
          id: unifiedId, // Zomato IDs start from 9000000 to avoid conflicts
          po_number: zomatoPo.po_number,
          po_date: zomatoPo.po_date || new Date(), // Ensure we have a valid date
          order_date: zomatoPo.po_date || new Date(), // Frontend expects order_date
          platform: { id: 9, pf_name: "Zomato" },
          vendor_name: zomatoPo.bill_from_name || 'KNOWTABLE ONLINE SERVICES PRIVATE LIMITED',
          status: 'Active',
          created_at: zomatoPo.created_at,
          updated_at: zomatoPo.updated_at,
          expiry_date: zomatoPo.expected_delivery_date || null,
          serving_distributor: null,
          city: 'Mumbai', // Default for Zomato Hyperpure
          state: 'Maharashtra',
          region: '',
          area: '',
          appointment_date: null,
          delivery_date: zomatoPo.expected_delivery_date || null,
          attachment: null,
          orderItems: orderItems
        };

        result.push(originalZomatoPo as any);
      }
    } catch (error) {
      console.error('❌ getAllPos: Error fetching Zomato POs:', error);
    }

    // Fetch Amazon POs from amazon_po_header (original Amazon data)
    try {
      const amazonPos = await this.getAllAmazonPos();
      console.log(`📊 getAllPos: Found ${amazonPos.length} Amazon POs from amazon_po_header (original data)`);

      // Get Amazon platform from database
      const amazonPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Amazon')).limit(1);
      const amazonPlatformId = amazonPlatform[0]?.id || 10; // Fallback to 10 if not found
      console.log(`📊 getAllPos: Amazon platform ID: ${amazonPlatformId}`);

      for (const amazonPo of amazonPos) {
        // Calculate total amount from po lines
        const totalAmount = amazonPo.poLines?.reduce((sum, line) => {
          const lineTotal = parseFloat(line.net_amount?.toString() || line.total_cost?.toString() || '0');
          return sum + lineTotal;
        }, 0) || parseFloat(amazonPo.net_amount?.toString() || amazonPo.total_amount?.toString() || '0');

        // Calculate the unified ID
        const unifiedId = 10000000 + amazonPo.id; // Amazon IDs start from 10000000 to avoid conflicts

        // Map order items
        const orderItems = amazonPo.poLines?.map((line: any, index: number) => ({
          id: line.id,
          po_id: unifiedId,
          item_name: line.product_name || line.product_description || '',
          item_code: line.sku || line.asin || '',
          sap_code: line.sku || line.asin || '',
          quantity: parseInt(line.quantity_ordered?.toString() || '0', 10),
          basic_rate: line.unit_cost?.toString() || '0',
          gst_rate: line.tax_rate?.toString() || '0',
          landing_rate: line.net_amount?.toString() || line.unit_cost?.toString() || '0',
          total_amount: line.net_amount?.toString() || line.total_cost?.toString() || '0',
          status: 'Active',
          platform_code: line.sku || line.asin || '',
          uom: 'PCS',
          hsn_code: '',
          mrp: '0',
          cost_price: parseFloat(line.unit_cost?.toString() || '0'),
          po_line_number: line.line_number || index + 1,
          product_description: line.product_description || line.product_name || '',
          create_on: line.created_at || new Date(),
          create_by: 'amazon',
          modify_on: line.updated_at || line.created_at || new Date(),
          modify_by: 'amazon'
        })) || [];

        // Use original Amazon data exactly as uploaded
        const originalAmazonPo = {
          id: unifiedId,
          po_number: amazonPo.po_number,
          po_date: amazonPo.po_date || new Date(),
          order_date: amazonPo.po_date || new Date(),
          platform: { id: amazonPlatformId, pf_name: "Amazon" },
          vendor_name: amazonPo.vendor_name || amazonPo.buyer_name || 'Amazon',
          buyer_name: amazonPo.buyer_name || 'Amazon',
          status: amazonPo.status || 'Open',
          created_at: amazonPo.created_at,
          updated_at: amazonPo.updated_at,
          expiry_date: amazonPo.delivery_date || null,
          delivery_date: amazonPo.delivery_date || null,
          shipment_date: amazonPo.shipment_date || null,
          serving_distributor: amazonPo.vendor_name || null,
          city: amazonPo.ship_to_location || '',
          state: '',
          region: '',
          area: '',
          ship_to_address: amazonPo.ship_to_address || '',
          bill_to_location: amazonPo.bill_to_location || '',
          vendor_code: amazonPo.vendor_code || '',
          currency: amazonPo.currency || 'INR',
          total_amount: amazonPo.net_amount?.toString() || amazonPo.total_amount?.toString() || totalAmount.toString(),
          tax_amount: amazonPo.tax_amount?.toString() || '0',
          shipping_cost: amazonPo.shipping_cost?.toString() || '0',
          discount_amount: amazonPo.discount_amount?.toString() || '0',
          net_amount: amazonPo.net_amount?.toString() || totalAmount.toString(),
          notes: amazonPo.notes || '',
          orderItems: orderItems
        };

        result.push(originalAmazonPo as any);
      }
    } catch (error) {
      console.error('❌ getAllPos: Error fetching Amazon POs:', error);
    }

    // PRIORITY 2: Fetch POs from po_master table (but exclude platform-specific tables to avoid duplicates)
    const posWithPlatforms = await db
      .select({
        po: poMaster,
        platform: pfMst
      })
      .from(poMaster)
      .leftJoin(pfMst, eq(poMaster.platform_id, pfMst.id))
      .where(and(
        ne(poMaster.series, 'Blinkit'), // Exclude Blinkit POs since we're showing original data
        ne(poMaster.series, 'Zepto'),   // Exclude Zepto POs since we're showing original data
        ne(poMaster.series, 'Flipkart'), // Exclude Flipkart POs since we're showing original data
        ne(poMaster.series, 'CityMall') // Exclude CityMall POs since we're showing original data
      ))
      .orderBy(desc(poMaster.create_on));

    console.log(`📊 getAllPos: Found ${posWithPlatforms.length} non-platform-specific POs from po_master table`);

    // Process POs from po_master table
    for (const poWithPlatform of posWithPlatforms) {
      const po = poWithPlatform.po;
      const platform = poWithPlatform.platform;
      
      console.log(`🔍 Processing PO ${po.id} - ${po.vendor_po_number} with state_id: ${po.state_id}, district_id: ${po.district_id}`);
      
      // Special debug for SWIGGY221
      if (po.vendor_po_number && po.vendor_po_number.includes('SWIGGY221')) {
        console.log(`🎯 SWIGGY221 DEBUG:`, {
          id: po.id,
          vendor_po_number: po.vendor_po_number,
          state_id: po.state_id,
          district_id: po.district_id,
          region: po.region,
          area: po.area,
          po_date: po.po_date
        });
      }
      
      // Get associated po_lines data with product information
      const linesWithProducts = await db
        .select({
          line: poLines,
          product: pfItemMst
        })
        .from(poLines)
        .leftJoin(pfItemMst, eq(poLines.platform_product_code_id, pfItemMst.id))
        .where(eq(poLines.po_id, po.id))
        .orderBy(poLines.id);
      
      console.log(`📊 Found ${linesWithProducts.length} line items for PO ${po.id}`);
      
      // Get state information if available
      let stateName = '';
      if (po.state_id) {
        try {
          const stateResult = await db.select().from(states).where(eq(states.id, po.state_id)).limit(1);
          stateName = stateResult[0]?.statename || '';
          console.log(`🗺️ State for PO ${po.id}: ${stateName}`);
        } catch (error) {
          console.log(`⚠️ Could not fetch state for ID ${po.state_id}:`, error);
        }
      }
      
      // Get district information if available
      let districtName = '';
      if (po.district_id) {
        try {
          const districtResult = await db.select().from(districts).where(eq(districts.id, po.district_id)).limit(1);
          districtName = districtResult[0]?.district || '';
          console.log(`🏜️ District for PO ${po.id}: ${districtName}`);
        } catch (error) {
          console.log(`⚠️ Could not fetch district for ID ${po.district_id}:`, error);
        }
      }
      
      // Get distributor information if available (using same table as edit view)
      let distributorName = 'Unknown';
      if (po.distributor_id) {
        try {
          const distributorResult = await db.select().from(distributorMst).where(eq(distributorMst.id, po.distributor_id)).limit(1);
          distributorName = distributorResult[0]?.distributor_name || 'Unknown';
          console.log(`🏪 Distributor for PO ${po.id}: ${distributorName}`);
        } catch (error) {
          console.log(`⚠️ Could not fetch distributor for ID ${po.distributor_id}:`, error);
        }
      }
      
      // Map status from status_id (if exists) or default to 'Open'
      let poStatus = 'Open'; // Default status for new POs
      if (po.status_id !== null && po.status_id !== undefined) {
        // Map status_id to status text if needed
        switch(po.status_id) {
          case 1: poStatus = 'Open'; break;
          case 2: poStatus = 'Closed'; break;
          case 3: poStatus = 'Cancelled'; break;
          case 4: poStatus = 'Expired'; break;
          default: poStatus = 'Open';
        }
      }
      
      // Convert po_master format to expected frontend format
      const convertedPo = {
        id: po.id,
        po_number: po.vendor_po_number || 'UNKNOWN',
        platform: platform || { id: 1, pf_name: 'Unknown Platform' },
        serving_distributor: distributorName, // Use actual distributor name
        order_date: po.po_date ? new Date(po.po_date) : new Date(),
        expiry_date: po.expiry_date ? new Date(po.expiry_date) : null,
        appointment_date: po.appointment_date ? new Date(po.appointment_date) : null,
        city: districtName, // Use district as city
        state: stateName, // Use actual state name from state_id
        status: poStatus, // Use mapped status
        attachment: null, // Not available in current schema
        created_at: po.create_on ? new Date(po.create_on) : new Date(),
        updated_at: po.updated_on ? new Date(po.updated_on) : new Date(),
        region: po.region || '', // Use region from po_master
        area: po.area || '', // Use area from po_master
        orderItems: linesWithProducts.length > 0 ? linesWithProducts.map((lineWithProduct: any) => {
          const line = lineWithProduct.line;
          const product = lineWithProduct.product;
          
          return {
            id: line.id,
            po_id: po.id,
            item_name: product?.pf_itemname || `Product ID: ${line.platform_product_code_id}`, // Use actual product name
            quantity: parseFloat(line.quantity || '0'),
            sap_code: product?.pf_itemcode || null, // Use platform item code as SAP code
            category: null, // Not available in current schema
            subcategory: null, // Not available in current schema
            basic_rate: String(line.basic_amount || '0'),
            gst_rate: String(line.tax || '0'),
            landing_rate: String(line.landing_amount || line.total_amount || '0'),
            total_litres: line.total_liter || null,
            status: line.status ? String(line.status) : 'Pending', // Convert status to string
            hsn_code: null, // Not available in current schema
            platform_code: product?.pf_itemcode || null, // Use platform item code
            uom: line.uom || 'PCS',
            boxes: line.boxes || null,
            invoice_date: line.invoice_date ? String(line.invoice_date) : null,
            invoice_litre: line.invoice_litre ? String(line.invoice_litre) : null,
            invoice_amount: line.invoice_amount ? String(line.invoice_amount) : null,
            invoice_qty: line.invoice_qty ? String(line.invoice_qty) : null
          };
        }) : [
          // If no lines exist, create a placeholder item to show PO exists
          {
            id: 0,
            po_id: po.id,
            item_name: `Items for PO ${po.vendor_po_number}`,
            quantity: 1,
            sap_code: null,
            category: null,
            subcategory: null,
            basic_rate: '0.00',
            gst_rate: '0.00',
            landing_rate: '0.00',
            total_litres: null,
            status: 'Pending',
            hsn_code: null,
            platform_code: null,
            uom: "PCS",
            boxes: null,
            invoice_date: null,
            invoice_litre: null,
            invoice_amount: null,
            invoice_qty: null
          }
        ],
        state_id: po.state_id,
        district_id: po.district_id
      };
      
      console.log(`✅ PO ${po.id} final data:`, {
        id: convertedPo.id,
        po_number: convertedPo.po_number,
        city: convertedPo.city,
        state: convertedPo.state,
        region: convertedPo.region,
        area: convertedPo.area,
        orderItemsCount: convertedPo.orderItems.length,
        firstItemValue: convertedPo.orderItems[0]?.landing_rate || 'No items'
      });
      
      result.push(convertedPo);
    }

    // Note: We now prioritize platform-specific data (like blinkit_po_header) over unified data
    // This ensures users see the exact original data from each platform
    console.log(`📊 getAllPos: Prioritizing platform-specific original data for better accuracy`);

    // Sort results by created_at descending (most recent uploads first)
    result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    console.log(`📊 getAllPos: Returning ${result.length} POs total (po_master + Zepto + Blinkit + Swiggy + Flipkart + BigBasket + CityMall + Dealshare + Zomato)`);

    return result;
  }

  // DEBUG: Get raw database data to understand structure  
  async getRawPoData(id: number): Promise<any> {
    // Get raw data from po_master table
    const [masterResult] = await db
      .select()
      .from(poMaster)
      .where(eq(poMaster.id, id))
      .limit(1);

    if (!masterResult) return null;

    // Get raw data from po_lines table
    const linesResult = await db
      .select()
      .from(poLines)
      .where(eq(poLines.po_id, id));

    return {
      po_master: masterResult,
      po_lines: linesResult,
      summary: {
        total_fields_in_po_master: Object.keys(masterResult).length,
        po_master_fields: Object.keys(masterResult),
        total_lines: linesResult.length,
        po_lines_sample_fields: linesResult.length > 0 ? Object.keys(linesResult[0]) : []
      }
    };
  }

  // Helper function to find distributor with fuzzy matching
  private async findDistributorByName(vendorName: string): Promise<{ id: number; distributor_name: string } | undefined> {
    console.log(`🔍 Looking up distributor for vendor: "${vendorName}"`);

    try {
      // Try exact match first (case-insensitive)
      let foundDistributor = await db.select().from(distributorMst)
        .where(sql`LOWER(${distributorMst.distributor_name}) = LOWER(${vendorName})`)
        .limit(1);

      // If no exact match, try partial match using simple ILIKE
      if (!foundDistributor || foundDistributor.length === 0) {
        console.log(`🔍 Trying partial match for: "${vendorName}"`);

        // Try: distributor_name contains vendor name
        foundDistributor = await db.select().from(distributorMst)
          .where(sql`${distributorMst.distributor_name} ILIKE ${`%${vendorName}%`}`)
          .limit(1);

        // If still not found, try: vendor name contains distributor name
        if (!foundDistributor || foundDistributor.length === 0) {
          const allDists = await db.select().from(distributorMst);
          for (const dist of allDists) {
            if (vendorName.toLowerCase().includes(dist.distributor_name.toLowerCase())) {
              foundDistributor = [dist];
              console.log(`🔍 Found via reverse match: "${dist.distributor_name}" is in "${vendorName}"`);
              break;
            }
          }
        }
      }

      if (foundDistributor && foundDistributor.length > 0) {
        console.log(`✅ Found distributor ID ${foundDistributor[0].id}: ${foundDistributor[0].distributor_name}`);
        return {
          id: foundDistributor[0].id,
          distributor_name: foundDistributor[0].distributor_name
        };
      } else {
        console.log(`⚠️ Distributor "${vendorName}" not found in distributors table.`);
        return undefined;
      }
    } catch (error) {
      console.error(`❌ Error finding distributor for "${vendorName}":`, error);
      return undefined;
    }
  }

  async getPoById(id: number): Promise<(Omit<PfPo, 'platform'> & { platform: PfMst; orderItems: PfOrderItems[] }) | undefined> {
    console.log(`🔍 getPoById: Starting search for PO ${id} - prioritizing platform-specific data`);

    // PRIORITY 1: Check Zepto-specific tables first (original data)
    console.log(`🔍 getPoById: Checking Zepto tables for PO ${id}...`);
    try {
      const zeptoPo = await this.getZeptoPOById(id);
      if (zeptoPo) {
        console.log(`✅ getPoById: Found Zepto PO ${id} in zepto_po_header (using original data)`);

        // Get Zepto platform from database to ensure correct ID
        const zeptoPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Zepto')).limit(1);
        const zeptoPlatformId = zeptoPlatform[0]?.id || 3;

        // Find distributor by vendor name using fuzzy matching
        const zeptoDistributorObj = zeptoPo.vendor_name ? await this.findDistributorByName(zeptoPo.vendor_name) : undefined;

        // Return RAW Zepto table data PLUS frontend compatibility fields
        const rawZeptoPo = {
          // All original zepto_po_header columns exactly as they are
          ...zeptoPo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: zeptoPlatformId, pf_name: "Zepto" },
          distributor: zeptoDistributorObj,
          expiry_date: zeptoPo.po_expiry_date,
          city: zeptoPo.delivery_location || '',
          state: '',
          serving_distributor: zeptoPo.vendor_name,
          // Convert poLines to exact zepto_po_lines column names + frontend compatibility
          orderItems: zeptoPo.poLines.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.sku_desc || 'Zepto Product',
            platform_code: line.sku_code || '',
            sap_code: line.sku_code || '',
            quantity: line.po_qty || 0,
            basic_rate: line.landing_cost?.toString() || '0',
            basic_amount: parseFloat(line.landing_cost?.toString() || '0'), // Required by form validation
            landing_rate: line.landing_cost?.toString() || '0',
            total_amount: line.total_value?.toString() || '0',
            tax_percent: 0, // Required by form validation - default to 0 if not available
            uom: 'PCS',
            hsn_code: line.hsn_code || '',
            // Original zepto_po_lines columns
            id: line.id,
            zepto_po_header_id: line.zepto_po_header_id,
            sku_code: line.sku_code,
            sku_desc: line.sku_desc,
            po_qty: line.po_qty,
            landing_cost: line.landing_cost,
            total_value: line.total_value,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        console.log(`✅ getPoById: Returning RAW Zepto PO ${id} with ${rawZeptoPo.orderItems.length} items`);
        return rawZeptoPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Zepto tables for PO ${id}:`, error);
    }

    // PRIORITY 2: Check Blinkit-specific tables (original data)
    console.log(`🔍 getPoById: Checking Blinkit tables for PO ${id}...`);
    try {
      const blinkitPo = await this.getBlinkitPoById(id);
      if (blinkitPo) {
        console.log(`✅ getPoById: Found Blinkit PO ${id} in blinkit_po_header (using original data)`);

        // Get Blinkit platform from database to ensure correct ID
        const blinkitPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Blinkit')).limit(1);
        const blinkitPlatformId = blinkitPlatform[0]?.id || 1;

        // Find distributor by vendor name using fuzzy matching
        const blinkitDistributorObj = blinkitPo.vendor_name ? await this.findDistributorByName(blinkitPo.vendor_name) : undefined;

        // Return RAW Blinkit table data PLUS frontend compatibility fields
        const rawBlinkitPo = {
          // All original blinkit_po_header columns exactly as they are
          ...blinkitPo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: blinkitPlatformId, pf_name: "Blinkit" },
          distributor: blinkitDistributorObj,
          expiry_date: blinkitPo.po_expiry_date,
          serving_distributor: blinkitPo.vendor_name,
          // Convert poLines to exact blinkit_po_lines column names + frontend compatibility
          orderItems: blinkitPo.poLines.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.product_description || 'Blinkit Product',
            platform_code: line.sku_code || '',
            sap_code: line.sku_code || '',
            quantity: line.quantity || 0,
            basic_rate: line.landing_rate?.toString() || '0',
            basic_amount: parseFloat(line.landing_rate?.toString() || '0'), // Required by form validation
            landing_rate: line.landing_rate?.toString() || '0',
            total_amount: line.total_amount?.toString() || '0',
            tax_percent: 0, // Required by form validation - default to 0 if not available
            uom: 'PCS',
            hsn_code: line.hsn_code || '',
            // Original blinkit_po_lines columns
            id: line.id,
            blinkit_po_header_id: line.blinkit_po_header_id,
            sku_code: line.sku_code,
            product_description: line.product_description,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        return rawBlinkitPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Blinkit tables for PO ${id}:`, error);
    }

    // PRIORITY 3: Check Swiggy-specific tables (original data)
    console.log(`🔍 getPoById: Checking Swiggy tables for PO ${id}...`);
    try {
      const swiggyPo = await this.getSwiggyPoById(id);
      if (swiggyPo) {
        console.log(`✅ getPoById: Found Swiggy PO ${id} in swiggy_pos (using original data)`);

        // Get Swiggy platform from database to ensure correct ID
        const swiggyPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Swiggy')).limit(1);
        const swiggyPlatformId = swiggyPlatform[0]?.id || 4;

        // Find distributor by vendor name using fuzzy matching
        const distributorObj = swiggyPo.vendor_name ? await this.findDistributorByName(swiggyPo.vendor_name) : undefined;

        // Return RAW Swiggy table data PLUS frontend compatibility fields
        const rawSwiggyPo = {
          // All original swiggy_pos columns exactly as they are
          ...swiggyPo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: swiggyPlatformId, pf_name: "Swiggy" },
          distributor: distributorObj,
          expiry_date: swiggyPo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: swiggyPo.vendor_name,
          // Convert poLines to exact swiggy_po_lines column names + frontend compatibility
          orderItems: swiggyPo.poLines.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.item_description || 'Swiggy Product',
            product_description: line.item_description,
            platform_code: line.item_code || '',
            sap_code: line.item_code || '',
            quantity: line.quantity || 0,
            basic_rate: line.unit_base_cost?.toString() || '0',
            basic_amount: parseFloat(line.unit_base_cost?.toString() || '0'), // Required by form validation
            landing_rate: line.unit_base_cost?.toString() || '0',
            total_amount: line.line_total?.toString() || '0',
            tax_amount: line.total_tax_amount?.toString() || '0',
            tax_percent: 0, // Required by form validation - default to 0 if not available
            mrp: line.mrp?.toString() || '0',
            hsn_code: line.hsn_code || '',
            uom: 'PCS',
            // Original swiggy_po_lines columns
            id: line.id,
            swiggy_po_id: line.swiggy_po_id,
            item_code: line.item_code,
            unit_base_cost: line.unit_base_cost,
            line_total: line.line_total,
            total_tax_amount: line.total_tax_amount,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        console.log(`✅ getPoById: Returning RAW Swiggy PO ${id} with ${rawSwiggyPo.orderItems.length} items`);
        return rawSwiggyPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Swiggy tables for PO ${id}:`, error);
    }

    // PRIORITY 4: Check Flipkart-specific tables (original data)
    console.log(`🔍 getPoById: Checking Flipkart tables for PO ${id}...`);
    try {
      const flipkartPo = await this.getFlipkartGroceryPoById(id);
      if (flipkartPo) {
        console.log(`✅ getPoById: Found Flipkart PO ${id} in flipkart_grocery_po_header (using original data)`);

        // Get Flipkart platform from database to ensure correct ID
        const flipkartPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Flipkart')).limit(1);
        const flipkartPlatformId = flipkartPlatform[0]?.id || 5;

        // Find distributor by supplier name using fuzzy matching
        const flipkartDistributorObj = flipkartPo.supplier_name ? await this.findDistributorByName(flipkartPo.supplier_name) : undefined;

        // Return RAW Flipkart table data PLUS frontend compatibility fields
        const rawFlipkartPo = {
          // All original flipkart_grocery_po_header columns exactly as they are
          ...flipkartPo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: flipkartPlatformId, pf_name: "Flipkart" },
          distributor: flipkartDistributorObj,
          po_date: flipkartPo.order_date || flipkartPo.created_at,
          order_date: flipkartPo.order_date || flipkartPo.created_at,
          expiry_date: flipkartPo.expiry_date,
          city: flipkartPo.location || '',
          state: flipkartPo.state || '',
          serving_distributor: flipkartPo.supplier_name || '',
          vendor_name: flipkartPo.supplier_name || '',
          // Convert poLines to exact flipkart_grocery_po_lines column names + frontend compatibility
          orderItems: flipkartPo.poLines.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.title || 'Flipkart Product',
            product_description: line.title,
            platform_code: line.fsn_isbn || line.ean || '',
            sap_code: line.ean || '',
            quantity: line.quantity || 0,
            basic_rate: line.supplier_price?.toString() || '0',
            basic_amount: parseFloat(line.supplier_price?.toString() || '0'), // Required by form validation
            landing_rate: line.supplier_price?.toString() || '0',
            total_amount: line.total_amount?.toString() || '0',
            tax_percent: 0, // Required by form validation - default to 0 if not available
            mrp: line.supplier_mrp?.toString() || '0',
            hsn_code: line.hsn_code || '',
            uom: 'PCS',
            // Original flipkart_grocery_po_lines columns
            id: line.id,
            flipkart_grocery_po_header_id: line.flipkart_grocery_po_header_id,
            fsn_isbn: line.fsn_isbn,
            ean: line.ean,
            title: line.title,
            supplier_price: line.supplier_price,
            supplier_mrp: line.supplier_mrp,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        console.log(`✅ getPoById: Returning RAW Flipkart PO ${id} with ${rawFlipkartPo.orderItems.length} items`);
        return rawFlipkartPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Flipkart tables for PO ${id}:`, error);
    }

    // PRIORITY 5: Check BigBasket-specific tables (original data)
    console.log(`🔍 getPoById: Checking BigBasket tables for PO ${id}...`);
    try {
      // Check if this is a BigBasket ID (starts with 12000000)
      let bigbasketId = id;
      if (id >= 12000000 && id < 13000000) {
        bigbasketId = id - 12000000; // Convert back to original BigBasket ID
        console.log(`🔍 getPoById: Detected BigBasket ID mapping ${id} -> ${bigbasketId}`);
      }

      const bigbasketPo = await this.getBigbasketPoById(bigbasketId);
      if (bigbasketPo) {
        console.log(`✅ getPoById: Found BigBasket PO ${id} in bigbasket_po_header (using original data)`);

        // Get BigBasket platform from database to ensure correct ID
        const bigbasketPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'BigBasket')).limit(1);
        const bigbasketPlatformId = bigbasketPlatform[0]?.id || 12;

        // Find distributor by supplier name using fuzzy matching
        const bigbasketDistributorObj = bigbasketPo.supplier_name ? await this.findDistributorByName(bigbasketPo.supplier_name) : undefined;

        // Return RAW BigBasket table data PLUS frontend compatibility fields
        const rawBigBasketPo = {
          // All original bigbasket_po_header columns exactly as they are
          ...bigbasketPo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: bigbasketPlatformId, pf_name: "BigBasket" },
          distributor: bigbasketDistributorObj,
          po_date: bigbasketPo.po_date,
          order_date: bigbasketPo.po_date,
          expiry_date: bigbasketPo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: bigbasketPo.supplier_name || '',
          vendor_name: bigbasketPo.supplier_name || '',
          total_amount: bigbasketPo.grand_total?.toString() || '0',
          // Convert poLines to exact bigbasket_po_lines column names + frontend compatibility
          orderItems: bigbasketPo.poLines.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.product_name || 'BigBasket Product',
            product_description: line.product_name,
            platform_code: line.sku_code || '',
            sap_code: line.sku_code || '',
            quantity: line.order_quantity || 0,
            basic_rate: line.purchase_rate?.toString() || '0',
            basic_amount: parseFloat(line.purchase_rate?.toString() || '0'), // Required by form validation
            landing_rate: line.purchase_rate?.toString() || '0',
            total_amount: line.total_amount?.toString() || '0',
            tax_percent: 0, // Required by form validation - default to 0 if not available
            mrp: line.mrp?.toString() || '0',
            hsn_code: line.hsn_code || '',
            uom: 'PCS',
            // Original bigbasket_po_lines columns
            id: line.id,
            bigbasket_po_header_id: line.bigbasket_po_header_id,
            sku_code: line.sku_code,
            product_name: line.product_name,
            order_quantity: line.order_quantity,
            purchase_rate: line.purchase_rate,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        console.log(`✅ getPoById: Returning RAW BigBasket PO ${id} with ${rawBigBasketPo.orderItems.length} items`);
        return rawBigBasketPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking BigBasket tables for PO ${id}:`, error);
    }

    // PRIORITY 6: Check CityMall-specific tables (original data)
    console.log(`🔍 getPoById: Checking CityMall tables for PO ${id}...`);
    try {
      // Check if this is a CityMall ID (starts with 7000000)
      let cityMallId = id;
      if (id >= 7000000 && id < 8000000) {
        cityMallId = id - 7000000; // Convert back to original CityMall ID
        console.log(`🔍 getPoById: Detected CityMall ID mapping ${id} -> ${cityMallId}`);
      }

      const cityMallPo = await this.getCityMallPoById(cityMallId);
      if (cityMallPo) {
        console.log(`✅ getPoById: Found CityMall PO ${id} in city_mall_po_header (using original data)`);

        // Get CityMall platform from database to ensure correct ID
        const cityMallPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'CityMall')).limit(1);
        const cityMallPlatformId = cityMallPlatform[0]?.id || 7;

        // Find distributor by vendor name using fuzzy matching
        const cityMallDistributorObj = cityMallPo.vendor_name ? await this.findDistributorByName(cityMallPo.vendor_name) : undefined;

        // Return RAW CityMall table data PLUS frontend compatibility fields
        const rawCityMallPo = {
          // All original city_mall_po_header columns exactly as they are
          ...cityMallPo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: cityMallPlatformId, pf_name: "CityMall" },
          distributor: cityMallDistributorObj,
          order_date: cityMallPo.po_date,
          expiry_date: cityMallPo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: '',
          // Convert poLines to exact city_mall_po_lines column names + frontend compatibility
          orderItems: cityMallPo.poLines.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.article_name || 'CityMall Product',
            product_description: line.article_name,
            platform_code: line.article_id || '',
            sap_code: line.article_id || '',
            quantity: line.quantity || 0,
            basic_rate: line.base_cost_price?.toString() || '0',
            landing_rate: line.base_cost_price?.toString() || '0',
            total_amount: line.total_amount?.toString() || '0',
            mrp: line.mrp?.toString() || '0',
            hsn_code: line.hsn_code || '',
            uom: 'PCS',
            igst_percent: line.igst_percent,
            cess_percent: line.cess_percent,
            igst_amount: line.igst_amount?.toString() || '0',
            cess_amount: line.cess_amount?.toString() || '0',
            // Original city_mall_po_lines columns
            id: line.id,
            city_mall_po_header_id: line.city_mall_po_header_id,
            article_id: line.article_id,
            article_name: line.article_name,
            base_cost_price: line.base_cost_price,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        console.log(`✅ getPoById: Returning RAW CityMall PO ${id} with ${rawCityMallPo.orderItems.length} items`);
        return rawCityMallPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking CityMall tables for PO ${id}:`, error);
    }

    // PRIORITY 7: Check Dealshare-specific tables (original data)
    console.log(`🔍 getPoById: Checking Dealshare tables for PO ${id}...`);
    try {
      // Check if this is a Dealshare ID (starts with 8000000)
      let dealshareId = id;
      if (id >= 8000000 && id < 9000000) {
        dealshareId = id - 8000000; // Convert back to original Dealshare ID
        console.log(`🔍 getPoById: Detected Dealshare ID mapping ${id} -> ${dealshareId}`);
      }

      const dealsharePo = await this.getDealsharePoById(dealshareId);
      if (dealsharePo) {
        console.log(`✅ getPoById: Found Dealshare PO ${id} in dealshare_po_header (using original data)`);

        // Get Dealshare platform from database to ensure correct ID
        const dealsharePlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Dealshare')).limit(1);
        const dealsharePlatformId = dealsharePlatform[0]?.id || 8;

        // Find distributor by shipped_by name using fuzzy matching
        const dealshareDistributorObj = dealsharePo.shipped_by ? await this.findDistributorByName(dealsharePo.shipped_by) : undefined;

        // Return RAW Dealshare table data PLUS frontend compatibility fields
        const rawDealsharePo = {
          // All original dealshare_po_header columns exactly as they are
          ...dealsharePo,
          // Frontend compatibility fields (mapped from raw data)
          // Add platform info for frontend identification (MUST be after spread to override any existing platform field)
          platform: { id: dealsharePlatformId, pf_name: "Dealshare" },
          distributor: dealshareDistributorObj,
          po_date: dealsharePo.po_created_date,
          order_date: dealsharePo.po_created_date,
          expiry_date: dealsharePo.po_expiry_date,
          city: '',
          state: '',
          serving_distributor: dealsharePo.shipped_by || '',
          vendor_name: dealsharePo.shipped_by || '',
          total_amount: dealsharePo.total_gross_amount?.toString() || '0',
          // Convert poItems to orderItems for frontend compatibility
          orderItems: dealsharePo.poItems.map(line => ({
            // Frontend compatibility fields (mapped from raw data)
            item_name: line.product_name || 'Dealshare Product',
            product_description: line.product_name,
            item_code: line.sku || '',
            platform_code: line.sku || '',
            sap_code: line.sku || '',
            quantity: line.quantity || 0,
            basic_rate: line.buying_price?.toString() || '0',
            basic_amount: parseFloat(line.buying_price?.toString() || '0'), // Required by form validation
            landing_rate: line.buying_price?.toString() || '0',
            total_amount: line.gross_amount?.toString() || '0',
            tax_percent: parseFloat(line.gst_percent?.toString() || '0'), // Use actual GST if available
            hsn_code: line.hsn_code || '',
            mrp: line.mrp_tax_inclusive?.toString() || '0',
            uom: 'PCS',
            gst_rate: line.gst_percent?.toString() || '0',
            cess_rate: line.cess_percent?.toString() || '0',
            // Original dealshare_po_lines columns
            id: line.id,
            dealshare_po_header_id: line.dealshare_po_header_id,
            sku: line.sku,
            product_name: line.product_name,
            buying_price: line.buying_price,
            gross_amount: line.gross_amount,
            gst_percent: line.gst_percent,
            cess_percent: line.cess_percent,
            mrp_tax_inclusive: line.mrp_tax_inclusive,
            created_at: line.created_at,
            updated_at: line.updated_at
          }))
        };

        console.log(`✅ getPoById: Returning RAW Dealshare PO ${id} with ${rawDealsharePo.orderItems.length} items`);
        return rawDealsharePo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Dealshare tables for PO ${id}:`, error);
    }

    // PRIORITY 8: Check Zomato-specific tables (original data)
    console.log(`🔍 getPoById: Checking Zomato tables for PO ${id}...`);
    try {
      // Check if this is a Zomato ID (starts with 9000000)
      let zomatoId = id;
      if (id >= 9000000 && id < 10000000) {
        zomatoId = id - 9000000; // Convert back to original Zomato ID
        console.log(`🔍 getPoById: Detected Zomato ID mapping ${id} -> ${zomatoId}`);
      }

      const zomatoPo = await this.getZomatoPoById(zomatoId);
      if (zomatoPo) {
        console.log(`✅ getPoById: Found Zomato PO ${id} in zomato_po_header (using original data)`);

        // Find distributor by bill_from_name using fuzzy matching
        const vendorName = zomatoPo.bill_from_name || 'KNOWTABLE ONLINE SERVICES PRIVATE LIMITED';
        const zomatoDistributorObj = await this.findDistributorByName(vendorName);

        // Return RAW Zomato table data PLUS frontend compatibility fields
        const rawZomatoPo = {
          // Add platform info for frontend identification
          platform: { id: 9, pf_name: "Zomato" },
          id: id, // Use the unified ID for consistency
          po_number: zomatoPo.po_number,
          po_date: zomatoPo.po_date || new Date(),
          order_date: zomatoPo.po_date || new Date(), // Frontend compatibility
          status: 'Active',
          created_at: zomatoPo.created_at,
          updated_at: zomatoPo.updated_at,
          expiry_date: zomatoPo.expected_delivery_date || null,
          vendor_name: vendorName,
          distributor: zomatoDistributorObj,
          buyer_name: zomatoPo.ship_to_name || 'Zomato Hyperpure Private Limited',
          vendor_address: zomatoPo.bill_from_address || '',
          buyer_address: zomatoPo.bill_to_address || '',
          vendor_gstin: zomatoPo.bill_from_gstin || '',
          buyer_gstin: zomatoPo.bill_to_gstin || '',
          total_amount: zomatoPo.grand_total?.toString() || '0',
          total_items: zomatoPo.total_items || 0,
          total_quantity: zomatoPo.total_quantity?.toString() || '0',
          city: 'Mumbai',
          state: 'Maharashtra',
          serving_distributor: '',
          region: '',
          area: '',
          appointment_date: null,
          delivery_date: zomatoPo.expected_delivery_date || null,
          attachment: null,
          orderItems: zomatoPo.poItems?.map((line: any, index: number) => ({
            id: line.id,
            po_id: id, // Use the unified ID
            item_name: line.product_name || '',
            sap_code: line.product_number || '',
            quantity: parseInt(line.quantity_ordered?.toString() || '1', 10),
            basic_rate: line.price_per_unit?.toString() || '0',
            basic_amount: parseFloat(line.price_per_unit?.toString() || '0'), // Required by form validation
            gst_rate: line.gst_rate?.toString() || '0',
            tax_percent: parseFloat(line.gst_rate?.toString() || '0'), // Use actual GST if available
            landing_rate: line.total_amount?.toString() || line.line_total?.toString() || '0',
            total_amount: line.total_amount?.toString() || line.line_total?.toString() || '0',
            status: 'active',
            create_on: line.created_at || new Date(),
            create_by: 'zomato',
            modify_on: line.updated_at || line.created_at || new Date(),
            modify_by: 'zomato',
            hsn_code: line.hsn_code || '',
            mrp: '0',
            cost_price: parseFloat(line.price_per_unit?.toString() || '0'),
            po_line_number: line.line_number || index + 1,
            uom: line.uom || 'PCS'
          })) || []
        };

        console.log(`✅ getPoById: Returning RAW Zomato PO ${id} with ${rawZomatoPo.orderItems.length} items`);
        return rawZomatoPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Zomato tables for PO ${id}:`, error);
    }

    // PRIORITY 9: Check Amazon-specific tables (original data)
    console.log(`🔍 getPoById: Checking Amazon tables for PO ${id}...`);
    try {
      // Check if this is an Amazon ID (starts with 10000000)
      let amazonId = id;
      if (id >= 10000000 && id < 11000000) {
        amazonId = id - 10000000; // Convert back to original Amazon ID
        console.log(`🔍 getPoById: Detected Amazon ID mapping ${id} -> ${amazonId}`);
      }

      console.log(`🔍 getPoById: Attempting to fetch Amazon PO with ID ${amazonId}...`);
      const amazonPo = await this.getAmazonPoById(amazonId);
      console.log(`🔍 getPoById: Amazon PO fetch result:`, amazonPo ? 'Found' : 'Not found');

      if (amazonPo) {
        console.log(`✅ getPoById: Found Amazon PO ${id} in amazon_po_header (using original data)`);

        // Get Amazon platform from database
        const amazonPlatform = await db.select().from(pfMst).where(eq(pfMst.pf_name, 'Amazon')).limit(1);
        const amazonPlatformId = amazonPlatform[0]?.id || 10;

        // Calculate total amount from po lines
        const totalAmount = amazonPo.poLines?.reduce((sum, line) => {
          const lineTotal = parseFloat(line.net_amount?.toString() || line.total_cost?.toString() || '0');
          return sum + lineTotal;
        }, 0) || parseFloat(amazonPo.net_amount?.toString() || amazonPo.total_amount?.toString() || '0');

        // Return RAW Amazon table data PLUS frontend compatibility fields
        const rawAmazonPo = {
          // Add platform info for frontend identification
          platform: { id: amazonPlatformId, pf_name: "Amazon" },
          id: id, // Use the unified ID for consistency
          po_number: amazonPo.po_number,
          po_date: amazonPo.po_date || new Date(),
          order_date: amazonPo.po_date || new Date(),
          status: amazonPo.status || 'Open',
          created_at: amazonPo.created_at,
          updated_at: amazonPo.updated_at,
          expiry_date: amazonPo.delivery_date || null,
          delivery_date: amazonPo.delivery_date || null,
          shipment_date: amazonPo.shipment_date || null,
          vendor_name: amazonPo.vendor_name || amazonPo.buyer_name || 'Amazon',
          buyer_name: amazonPo.buyer_name || 'Amazon',
          vendor_code: amazonPo.vendor_code || '',
          serving_distributor: amazonPo.vendor_name || null,
          city: amazonPo.ship_to_location || '',
          state: '',
          region: '',
          area: '',
          ship_to_address: amazonPo.ship_to_address || '',
          ship_to_location: amazonPo.ship_to_location || '',
          bill_to_location: amazonPo.bill_to_location || '',
          currency: amazonPo.currency || 'INR',
          total_amount: amazonPo.net_amount?.toString() || amazonPo.total_amount?.toString() || totalAmount.toString(),
          tax_amount: amazonPo.tax_amount?.toString() || '0',
          shipping_cost: amazonPo.shipping_cost?.toString() || '0',
          discount_amount: amazonPo.discount_amount?.toString() || '0',
          net_amount: amazonPo.net_amount?.toString() || totalAmount.toString(),
          notes: amazonPo.notes || '',
          orderItems: await Promise.all(amazonPo.poLines?.map(async (line: any, index: number) => {
            // Enrich item data by looking up in pf_item_mst and items tables
            let enrichedData = {
              item_name: line.product_name || line.product_description || '',
              basic_rate: line.unit_cost?.toString() || '0',
              basic_amount: parseFloat(line.unit_cost?.toString() || '0'),
              tax_percent: parseFloat(line.tax_rate?.toString() || '0'),
              landing_rate: line.net_amount?.toString() || line.unit_cost?.toString() || '0',
              mrp: '0',
              uom: 'PCS',
              hsn_code: ''
            };

            try {
              // Look up ASIN in pf_item_mst to get sap_id
              const asin = line.asin || line.sku || '';
              if (asin) {
                const pfItem = await db.select()
                  .from(pfItemMst)
                  .where(eq(pfItemMst.pf_itemcode, asin))
                  .limit(1);

                if (pfItem && pfItem.length > 0) {
                  const sapId = pfItem[0].sap_id;
                  console.log(`🔍 Found pf_item_mst for ASIN ${asin}, sap_id: ${sapId}`);

                  // Look up sap_id in items table to get enriched data
                  const itemData = await db.select()
                    .from(items)
                    .where(eq(items.itemcode, sapId))
                    .limit(1);

                  if (itemData && itemData.length > 0) {
                    const item = itemData[0];
                    console.log(`✅ Enriched item data for ${asin}:`, item.itemname);

                    enrichedData = {
                      item_name: item.itemname || enrichedData.item_name,
                      basic_rate: item.basic_rate?.toString() || item.landing_rate?.toString() || enrichedData.basic_rate,
                      basic_amount: parseFloat(item.basic_rate?.toString() || item.landing_rate?.toString() || enrichedData.basic_rate),
                      tax_percent: parseFloat(item.taxrate?.toString() || enrichedData.tax_percent.toString()),
                      landing_rate: item.landing_rate?.toString() || enrichedData.landing_rate,
                      mrp: item.mrp?.toString() || enrichedData.mrp,
                      uom: item.uom || enrichedData.uom,
                      hsn_code: enrichedData.hsn_code // HSN not in items table
                    };
                  }
                }
              }
            } catch (lookupError) {
              console.error(`❌ Error enriching item data for ASIN ${line.asin}:`, lookupError);
              // Continue with original data if lookup fails
            }

            return {
              id: line.id,
              po_id: id, // Use the unified ID
              item_name: enrichedData.item_name,
              item_code: line.sku || line.asin || '',
              sap_code: line.sku || line.asin || '',
              product_description: line.product_description || line.product_name || '',
              quantity: parseInt(line.quantity_ordered?.toString() || '0', 10),
              basic_rate: enrichedData.basic_rate,
              basic_amount: enrichedData.basic_amount, // Required by form validation
              gst_rate: line.tax_rate?.toString() || '0',
              tax_percent: enrichedData.tax_percent, // Use enriched or actual tax rate
              landing_rate: enrichedData.landing_rate,
              total_amount: line.net_amount?.toString() || line.total_cost?.toString() || '0',
            total_cost: line.total_cost?.toString() || '0',
            net_amount: line.net_amount?.toString() || '0',
            unit_cost: line.unit_cost?.toString() || '0',
            tax_rate: line.tax_rate?.toString() || '0',
            tax_amount: line.tax_amount?.toString() || '0',
            discount_percent: line.discount_percent?.toString() || '0',
            discount_amount: line.discount_amount?.toString() || '0',
            status: 'Active',
            platform_code: line.sku || line.asin || '',
            asin: line.asin || '',
            sku: line.sku || '',
            category: line.category || '',
            brand: line.brand || '',
            uom: enrichedData.uom,
            hsn_code: enrichedData.hsn_code,
            mrp: enrichedData.mrp,
            cost_price: parseFloat(line.unit_cost?.toString() || '0'),
            po_line_number: line.line_number || index + 1,
            line_number: line.line_number || index + 1,
            supplier_reference: line.supplier_reference || '',
            expected_delivery_date: line.expected_delivery_date || null,
            create_on: line.created_at || new Date(),
            create_by: 'amazon',
            modify_on: line.updated_at || line.created_at || new Date(),
            modify_by: 'amazon'
          };
        }) || [])
        };

        console.log(`✅ getPoById: Returning RAW Amazon PO ${id} with ${rawAmazonPo.orderItems.length} items`);
        return rawAmazonPo as any;
      }
    } catch (error) {
      console.error(`❌ getPoById: Error checking Amazon tables for PO ${id}:`, error);
    }

    // PRIORITY 10: Check po_master table (unified POs)
    const masterPoResult = await db
      .select({
        master: poMaster,
        platform: pfMst,
        distributor: distributors,
        state: states,
        district: districts
      })
      .from(poMaster)
      .leftJoin(pfMst, eq(poMaster.platform_id, pfMst.id))
      .leftJoin(distributors, eq(poMaster.distributor_id, distributors.id))
      .leftJoin(states, eq(poMaster.state_id, states.id))
      .leftJoin(districts, eq(poMaster.district_id, districts.id))
      .where(eq(poMaster.id, id))
      .limit(1);

    if (masterPoResult.length > 0) {
      const { master, platform, distributor, state, district } = masterPoResult[0];
      if (!platform) return undefined;

      // Get the line items for this PO
      const lines = await db
        .select({
          line: poLines,
          platformItem: pfItemMst
        })
        .from(poLines)
        .leftJoin(pfItemMst, eq(poLines.platform_product_code_id, pfItemMst.id))
        .where(eq(poLines.po_id, master.id));

      // Convert po_master format to pf_po format for compatibility
      const convertedPo = {
        id: master.id,
        po_number: master.vendor_po_number,
        company: "JIVO MART", // Default company name
        company_id: master.company_id, // Include company ID for editing
        platform: platform,
        serving_distributor: distributor?.name || null,
        distributor_id: master.distributor_id, // Include distributor ID for editing
        series: master.series, // Include series for editing (e.g., "PO")
        po_date: master.po_date,
        delivery_date: master.delivery_date, // Include delivery date for editing
        expiry_date: master.expiry_date,
        appointment_date: master.appointment_date,
        region: master.region,
        state: state?.statename || null,
        state_id: master.state_id, // Include state ID for editing
        city: district?.district || null,
        district_id: master.district_id, // Include district ID for editing
        area: master.area,
        dispatch_from: master.dispatch_from,
        ware_house: master.ware_house,
        warehouse: master.ware_house,
        status: master.status_id === 1 ? "OPEN" : master.status_id === 2 ? "INVOICED" : "OPEN", // Map status_id to status string
        status_id: master.status_id, // Include status ID for editing
        created_by: master.created_by, // Include created_by for editing
        comments: null, // Not stored in po_master currently
        created_at: master.create_on,
        updated_at: master.updated_on,
        order_date: master.po_date,
        orderItems: lines.length > 0 ? lines.map(({ line, platformItem }) => ({
          id: line.id,
          po_id: line.po_id,
          item_name: platformItem?.pf_itemname || `Product ID: ${line.platform_product_code_id}`,
          quantity: parseInt(line.quantity || '0'),
          sap_code: platformItem?.pf_itemcode || '',
          platform_code: platformItem?.pf_itemcode || '',
          uom: line.uom || 'PCS',
          basic_rate: line.basic_amount || '0.00',
          gst_rate: line.tax || '0.00',
          landing_rate: line.landing_amount || '0.00',
          boxes: line.boxes,
          unit_size_ltrs: parseFloat(line.total_liter || '0'),
          loose_qty: null,
          total_ltrs: parseFloat(line.total_liter || '0'),
          hsn_code: null,
          status: 'Pending',
          // Invoice fields from po_lines
          invoice_date: line.invoice_date,
          invoice_litre: line.invoice_litre ? parseFloat(line.invoice_litre) : null,
          invoice_amount: line.invoice_amount ? parseFloat(line.invoice_amount) : null,
          invoice_qty: line.invoice_qty ? parseFloat(line.invoice_qty) : null
        })) : []
      };

      return convertedPo as any;
    }

    // PRIORITY 10: Fallback to original pf_po table lookup
    console.log(`🔍 getPoById: Checking pf_po table for PO ${id}...`);
    const [result] = await db
      .select({
        po: pfPo,
        platform: pfMst
      })
      .from(pfPo)
      .leftJoin(pfMst, eq(pfPo.platform, pfMst.id))
      .where(eq(pfPo.id, id));

    if (!result) {
      console.log(`❌ getPoById: PO ${id} not found in any table`);
      return undefined;
    }

    console.log(`✅ getPoById: Found PO ${id} in pf_po table`);
    const orderItems = await db
      .select()
      .from(pfOrderItems)
      .where(eq(pfOrderItems.po_id, id));

    const { platform: platformId, ...poWithoutPlatform } = result.po;
    return {
      ...poWithoutPlatform,
      platform: result.platform!,
      orderItems
    };
  }

  async createPo(po: InsertPfPo, items: InsertPfOrderItems[]): Promise<PfPo> {
    return await db.transaction(async (tx) => {
      const [createdPo] = await tx.insert(pfPo).values(po).returning();
      
      if (items.length > 0) {
        const itemsWithPoId = items.map(item => ({
          ...item,
          po_id: createdPo.id
        }));
        await tx.insert(pfOrderItems).values(itemsWithPoId);
      }
      
      return createdPo;
    });
  }

  async updatePo(id: number, po: Partial<InsertPfPo>, items?: InsertPfOrderItems[]): Promise<PfPo> {
    console.log(`🔄 updatePo: Starting update for PO ID ${id}`);

    // First, determine which table this PO belongs to
    // Check po_master table first
    const poMasterResult = await db.select().from(poMaster).where(eq(poMaster.id, id)).limit(1);

    if (poMasterResult.length > 0) {
      console.log(`✅ updatePo: Found PO ${id} in po_master table`);
      return await this.updatePoMasterUnified(id, po, items);
    }

    // Check if it's a Blinkit PO
    const blinkitResult = await db.select().from(blinkitPoHeader).where(eq(blinkitPoHeader.id, id)).limit(1);

    if (blinkitResult.length > 0) {
      console.log(`✅ updatePo: Found PO ${id} in blinkit_po_header table`);
      return await this.updateBlinkitPoUnified(id, po, items);
    }

    // Fallback to pf_po table
    console.log(`🔍 updatePo: Checking pf_po table for PO ${id}`);
    return await db.transaction(async (tx) => {
      const [updatedPo] = await tx
        .update(pfPo)
        .set({ ...po, updated_at: new Date() })
        .where(eq(pfPo.id, id))
        .returning();

      if (items) {
        // Delete existing items
        await tx.delete(pfOrderItems).where(eq(pfOrderItems.po_id, id));

        // Insert new items
        if (items.length > 0) {
          const itemsWithPoId = items.map(item => ({
            ...item,
            po_id: id
          }));
          await tx.insert(pfOrderItems).values(itemsWithPoId);
        }
      }

      return updatedPo;
    });
  }

  // Update PO in po_master table (unified format)
  private async updatePoMasterUnified(id: number, po: Partial<InsertPfPo>, items?: InsertPfOrderItems[]): Promise<PfPo> {
    console.log(`🔄 updatePoMaster: Updating po_master record ${id}`);

    return await db.transaction(async (tx) => {
      // Map frontend PfPo format to po_master format
      const poMasterUpdate: any = {};

      if (po.po_number) poMasterUpdate.vendor_po_number = po.po_number;
      if (po.platform) poMasterUpdate.platform_id = po.platform;
      if (po.order_date) poMasterUpdate.po_date = new Date(po.order_date);
      if (po.expiry_date) poMasterUpdate.expiry_date = new Date(po.expiry_date);
      if (po.delivery_date) poMasterUpdate.delivery_date = new Date(po.delivery_date);
      if (po.appointment_date) poMasterUpdate.appointment_date = new Date(po.appointment_date);
      if (po.region) poMasterUpdate.region = po.region;
      if (po.area) poMasterUpdate.area = po.area;
      if (po.warehouse) poMasterUpdate.ware_house = po.warehouse;

      poMasterUpdate.updated_on = new Date();

      // Update po_master
      const [updatedMaster] = await tx
        .update(poMaster)
        .set(poMasterUpdate)
        .where(eq(poMaster.id, id))
        .returning();

      // Update po_lines if items provided
      if (items) {
        // Delete existing lines
        await tx.delete(poLines).where(eq(poLines.po_id, id));

        // Insert new lines
        if (items.length > 0) {
          for (const item of items) {
            // Get or create platform product code id
            let platformProductCodeId = 1; // Default fallback

            if (item.platform_code || item.sap_code) {
              const productCode = item.platform_code || item.sap_code;

              // Try to find existing product
              const existingProduct = await tx.select()
                .from(pfItemMst)
                .where(and(
                  eq(pfItemMst.pf_id, updatedMaster.platform_id),
                  eq(pfItemMst.pf_itemcode, productCode)
                ))
                .limit(1);

              if (existingProduct.length > 0) {
                platformProductCodeId = existingProduct[0].id;
              } else {
                // Create new product
                const newProduct = await tx.insert(pfItemMst).values({
                  pf_itemcode: productCode,
                  pf_itemname: item.item_name || 'Product',
                  pf_id: updatedMaster.platform_id,
                  sap_id: productCode
                }).returning();
                platformProductCodeId = newProduct[0].id;
              }
            }

            // Insert into po_lines
            await tx.insert(poLines).values({
              po_id: id,
              platform_product_code_id: platformProductCodeId,
              quantity: item.quantity?.toString() || '0',
              basic_amount: item.basic_rate || '0',
              tax: item.gst_rate || '0',
              landing_amount: item.landing_rate || '0',
              total_amount: item.total_amount || '0',
              uom: item.uom || 'PCS',
              total_liter: item.total_ltrs?.toString() || '0',
              status: 'active'
            });
          }
        }
      }

      // Return in PfPo format for compatibility
      return {
        id: updatedMaster.id,
        po_number: updatedMaster.vendor_po_number || '',
        platform: updatedMaster.platform_id,
        order_date: updatedMaster.po_date,
        expiry_date: updatedMaster.expiry_date,
        created_at: updatedMaster.create_on,
        updated_at: updatedMaster.updated_on
      } as any;
    });
  }

  // Update Blinkit PO and ensure it exists in both Blinkit tables AND po_master/po_lines
  private async updateBlinkitPoUnified(id: number, po: Partial<InsertPfPo>, items?: InsertPfOrderItems[]): Promise<PfPo> {
    console.log(`🔄 updateBlinkitPoUnified: Updating Blinkit PO ${id} in both Blinkit and unified tables`);

    return await db.transaction(async (tx) => {
      // Convert PfPo format to Blinkit format
      const blinkitHeaderUpdate: any = {};

      if (po.po_number) blinkitHeaderUpdate.po_number = po.po_number;
      if (po.order_date) blinkitHeaderUpdate.po_date = po.order_date;
      if (po.expiry_date) blinkitHeaderUpdate.po_expiry_date = po.expiry_date;
      if (po.delivery_date) blinkitHeaderUpdate.po_delivery_date = po.delivery_date;

      blinkitHeaderUpdate.updated_at = new Date();

      // Update blinkit_po_header
      const [updatedBlinkitHeader] = await tx
        .update(blinkitPoHeader)
        .set(blinkitHeaderUpdate)
        .where(eq(blinkitPoHeader.id, id))
        .returning();

      // Update blinkit_po_lines if items provided
      if (items) {
        // Delete existing Blinkit lines
        await tx.delete(blinkitPoLines).where(eq(blinkitPoLines.header_id, id));

        // Insert new Blinkit lines
        if (items.length > 0) {
          const blinkitLines = items.map((item, index) => ({
            po_header_id: id,
            line_number: index + 1,
            item_code: item.platform_code || item.sap_code || '',
            product_description: item.item_name || '',
            basic_cost_price: item.basic_rate || '0',
            tax_amount: item.gst_rate || '0',
            landing_rate: item.landing_rate || '0',
            quantity: item.quantity || 0,
            total_amount: item.total_amount || '0',
            hsn_code: item.hsn_code || '',
            product_upc: '',
            grammage: '',
            cgst_percent: '0',
            sgst_percent: '0',
            igst_percent: '0',
            cess_percent: '0',
            additional_cess: '0',
            mrp: '0',
            margin_percent: '0'
          }));

          await tx.insert(blinkitPoLines).values(blinkitLines);
        }
      }

      // Now also update/create corresponding po_master and po_lines records
      try {
        // Check if this Blinkit PO exists in po_master
        const existingPoMaster = await tx.select()
          .from(poMaster)
          .where(and(
            eq(poMaster.vendor_po_number, updatedBlinkitHeader.po_number),
            eq(poMaster.series, 'Blinkit')
          ))
          .limit(1);

        if (existingPoMaster.length > 0) {
          console.log(`🔄 updateBlinkitPoUnified: Updating existing po_master record`);
          // Update existing po_master record
          await this.updatePoMasterUnified(existingPoMaster[0].id, po, items);
        } else {
          console.log(`🔄 updateBlinkitPoUnified: Creating new po_master record for Blinkit PO`);
          // Create new po_master and po_lines records
          await this.insertIntoPoMasterAndLines(tx, 'Blinkit', updatedBlinkitHeader, items || []);
        }
      } catch (error) {
        console.error(`❌ updateBlinkitPoUnified: Error updating po_master:`, error);
        // Continue with Blinkit update even if po_master fails
      }

      // Return in PfPo format for compatibility
      return {
        id: updatedBlinkitHeader.id,
        po_number: updatedBlinkitHeader.po_number,
        platform: 1, // Blinkit platform ID
        order_date: updatedBlinkitHeader.po_date,
        expiry_date: updatedBlinkitHeader.po_expiry_date ? new Date(updatedBlinkitHeader.po_expiry_date) : null,
        created_at: updatedBlinkitHeader.created_at,
        updated_at: updatedBlinkitHeader.updated_at
      } as any;
    });
  }

  async deletePo(id: number): Promise<void> {
    console.log(`🗑️ Storage: Starting deletion for PO ID ${id}`);
    
    // Check if the PO exists in pf_po table first
    const existingPo = await db.select().from(pfPo).where(eq(pfPo.id, id));
    if (existingPo.length === 0) {
      console.log(`⚠️ Storage: PO with ID ${id} not found in pf_po table`);
      
      // Also check if it might exist in other PO tables (Flipkart, Zepto, etc.)
      console.log(`🔍 Storage: Checking if PO ID ${id} exists in other PO tables...`);
      
      // If PO doesn't exist anywhere, it might have been already deleted
      // Instead of throwing an error, we'll treat this as already deleted
      console.log(`ℹ️ Storage: PO ID ${id} already deleted or never existed - treating as successful deletion`);
      return;
    }
    
    console.log(`📝 Storage: Found PO to delete: ${existingPo[0].po_number}`);
    
    await db.transaction(async (tx) => {
      console.log(`🗑️ Storage: Deleting order items for PO ID ${id} from pf_order_items table`);
      const deletedItems = await tx.delete(pfOrderItems).where(eq(pfOrderItems.po_id, id));
      console.log(`✅ Storage: Deleted order items for PO ID ${id}`);
      
      console.log(`🗑️ Storage: Deleting PO record for ID ${id} from pf_po table`);
      const deletedPo = await tx.delete(pfPo).where(eq(pfPo.id, id));
      console.log(`✅ Storage: Deleted PO record for ID ${id}`);
    });
    
    // Verify deletion was successful
    const verifyDeletion = await db.select().from(pfPo).where(eq(pfPo.id, id));
    if (verifyDeletion.length > 0) {
      console.error(`❌ Storage: DELETION FAILED - PO ID ${id} still exists in database!`);
      throw new Error(`Failed to delete PO with ID ${id} - still exists in database`);
    }
    
    console.log(`✅ Storage: VERIFIED - PO ID ${id} successfully deleted from database`);
  }

  async getAllOrderItems(): Promise<(PfOrderItems & { po_number: string; platform_name: string; order_date: Date; expiry_date: Date | null; platform: PfMst })[]> {
    const results = await db
      .select({
        // Order item fields
        id: pfOrderItems.id,
        po_id: pfOrderItems.po_id,
        item_name: pfOrderItems.item_name,
        quantity: pfOrderItems.quantity,
        basic_rate: pfOrderItems.basic_rate,
        gst_rate: pfOrderItems.gst_rate,
        landing_rate: pfOrderItems.landing_rate,
        status: pfOrderItems.status,
        sap_code: pfOrderItems.sap_code,
        category: pfOrderItems.category,
        subcategory: pfOrderItems.subcategory,
        total_litres: pfOrderItems.total_litres,
        hsn_code: pfOrderItems.hsn_code,
        // PO fields
        po_number: pfPo.po_number,
        order_date: pfPo.order_date,
        expiry_date: pfPo.expiry_date,
        // Platform fields  
        platform_name: pfMst.pf_name,
        platform: pfMst
      })
      .from(pfOrderItems)
      .innerJoin(pfPo, eq(pfOrderItems.po_id, pfPo.id))
      .innerJoin(pfMst, eq(pfPo.platform, pfMst.id))
      .orderBy(desc(pfPo.created_at));

    return results.map(result => ({
      id: result.id,
      po_id: result.po_id,
      item_name: result.item_name,
      quantity: result.quantity,
      basic_rate: result.basic_rate,
      gst_rate: result.gst_rate,
      landing_rate: result.landing_rate,
      status: result.status,
      sap_code: result.sap_code,
      category: result.category,
      subcategory: result.subcategory,
      total_litres: result.total_litres,
      hsn_code: result.hsn_code,
      // Add missing required fields for PfOrderItems
      invoice_date: null,
      invoice_litre: null,
      invoice_amount: null,
      invoice_qty: null,
      po_number: result.po_number,
      platform_name: result.platform_name,
      order_date: result.order_date,
      expiry_date: result.expiry_date,
      platform: result.platform
    }));
  }

  async updateOrderItemStatus(id: number, status: string): Promise<PfOrderItems> {
    const [updatedItem] = await db
      .update(pfOrderItems)
      .set({ status })
      .where(eq(pfOrderItems.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error('Order item not found');
    }
    
    return updatedItem;
  }

  // Generic PO Master and Lines methods
  async getAllPoMasters(): Promise<(PoMaster & { platform: PfMst; poLines: PoLines[] })[]> {
    const masters = await db.select().from(poMaster).orderBy(desc(poMaster.create_on));
    
    const result = [];
    for (const master of masters) {
      // Get platform information
      const platform = await db.select().from(pfMst).where(eq(pfMst.id, master.platform_id)).limit(1);
      
      // Get associated po lines
      const lines = await db.select().from(poLines).where(eq(poLines.po_id, master.id));
      
      result.push({
        ...master,
        platform: platform[0],
        poLines: lines
      });
    }
    
    return result;
  }
  
  async getPoMasterById(id: number): Promise<(PoMaster & { platform: PfMst; poLines: PoLines[]; state?: any; district?: any; distributor?: any }) | undefined> {
    const master = await db.select().from(poMaster).where(eq(poMaster.id, id)).limit(1);
    if (!master[0]) return undefined;
    
    // Get platform information
    const platform = await db.select().from(pfMst).where(eq(pfMst.id, master[0].platform_id)).limit(1);
    
    // Get state information
    let state = null;
    if (master[0].state_id) {
      const stateResult = await db.select().from(states).where(eq(states.id, master[0].state_id)).limit(1);
      state = stateResult[0];
    }
    
    // Get district information
    let district = null;
    if (master[0].district_id) {
      const districtResult = await db.select().from(districts).where(eq(districts.id, master[0].district_id)).limit(1);
      district = districtResult[0];
    }
    
    // Get distributor information
    let distributor = null;
    if (master[0].distributor_id) {
      const distributorResult = await db.select().from(distributorMst).where(eq(distributorMst.id, master[0].distributor_id)).limit(1);
      distributor = distributorResult[0];
    }
    
    // Get associated po lines with product and tax rate information
    // Note: Removed items join due to database schema mismatch - items table doesn't have id column in physical database
    const linesWithProducts = await db
      .select({
        line: poLines,
        product: pfItemMst,
        sapItem: sql`NULL`.as('sapItem')  // Temporarily disabled due to schema issues
      })
      .from(poLines)
      .leftJoin(pfItemMst, eq(poLines.platform_product_code_id, pfItemMst.id))
      // .leftJoin(items, eq(pfItemMst.sap_id, items.itemcode))  // Disabled: causes "items.id does not exist" error
      .where(eq(poLines.po_id, id))
      .orderBy(poLines.id);
      
    // Transform lines to include product information
    const lines = linesWithProducts.map((lineWithProduct: any) => {
      const line = lineWithProduct.line;
      const product = lineWithProduct.product;
      
      return {
        ...line,
        // Add product information if available
        item_name: product?.pf_itemname || line.remark || `Product ID: ${line.platform_product_code_id}`,
        platform_code: product?.pf_itemcode || line.platform_product_code_id,
        sap_id: product?.sap_id || null,
        // Add original tax rate from items table
        original_tax_rate: lineWithProduct.sapItem?.taxrate || null
      };
    });
    
    return {
      ...master[0],
      platform: platform[0],
      poLines: lines,
      state,
      district,
      distributor
    };
  }
  
  async getPoMasterByNumber(poNumber: string): Promise<PoMaster | undefined> {
    const masters = await db.select().from(poMaster).where(eq(poMaster.vendor_po_number, poNumber)).limit(1);
    return masters[0];
  }
  
  async createPoMaster(master: InsertPoMaster, lines: InsertPoLines[]): Promise<PoMaster> {
    return await db.transaction(async (tx) => {
      const [createdMaster] = await tx.insert(poMaster).values(master).returning();
      
      if (lines.length > 0) {
        const linesWithMasterId = lines.map((line) => ({
          ...line,
          po_id: createdMaster.id
        }));
        await tx.insert(poLines).values(linesWithMasterId);
      }
      
      return createdMaster;
    });
  }
  
  async updatePoMaster(id: number, master: Partial<InsertPoMaster>, lines?: InsertPoLines[]): Promise<PoMaster> {
    return await db.transaction(async (tx) => {
      const [updatedMaster] = await tx
        .update(poMaster)
        .set({ ...master, updated_on: new Date() })
        .where(eq(poMaster.id, id))
        .returning();
      
      if (!updatedMaster) {
        throw new Error('PO Master not found');
      }
      
      if (lines) {
        // Delete existing lines
        await tx.delete(poLines).where(eq(poLines.po_id, id));
        
        // Insert new lines
        if (lines.length > 0) {
          const linesWithMasterId = lines.map((line) => ({
            ...line,
            po_id: id
          }));
          await tx.insert(poLines).values(linesWithMasterId);
        }
      }
      
      return updatedMaster;
    });
  }
  
  async deletePoMaster(id: number): Promise<void> {
    console.log(`🗑️ Storage: Starting po_master deletion for PO ID ${id}`);
    
    // First check if the PO exists in po_master table
    const existingPo = await db.select().from(poMaster).where(eq(poMaster.id, id));
    if (existingPo.length === 0) {
      console.log(`⚠️ Storage: PO with ID ${id} not found in po_master table`);
      console.log(`ℹ️ Storage: PO ID ${id} already deleted or never existed - treating as successful deletion`);
      return;
    }
    
    console.log(`📝 Storage: Found PO in po_master to delete: ${existingPo[0].vendor_po_number}`);
    
    await db.transaction(async (tx) => {
      console.log(`🗑️ Storage: Deleting po lines for PO ID ${id} from po_lines table`);
      const deletedLines = await tx.delete(poLines).where(eq(poLines.po_id, id));
      console.log(`✅ Storage: Deleted po lines for PO ID ${id}`);
      
      console.log(`🗑️ Storage: Deleting PO record for ID ${id} from po_master table`);
      const deletedPo = await tx.delete(poMaster).where(eq(poMaster.id, id));
      console.log(`✅ Storage: Deleted PO record from po_master for ID ${id}`);
    });
    
    // Verify deletion was successful
    const verifyDeletion = await db.select().from(poMaster).where(eq(poMaster.id, id));
    if (verifyDeletion.length > 0) {
      console.error(`❌ Storage: DELETION FAILED - PO ID ${id} still exists in po_master table!`);
      throw new Error(`Failed to delete PO with ID ${id} - still exists in po_master table`);
    }
    
    console.log(`✅ Storage: VERIFIED - PO ID ${id} successfully deleted from po_master table`);
  }

  // Flipkart Grocery PO methods
  async getAllFlipkartGroceryPos(): Promise<(FlipkartGroceryPoHeader & { poLines: FlipkartGroceryPoLines[] })[]> {
    const headers = await db.select().from(flipkartGroceryPoHeader).orderBy(desc(flipkartGroceryPoHeader.created_at));
    
    const result = [];
    for (const header of headers) {
      const lines = await db.select().from(flipkartGroceryPoLines)
        .where(eq(flipkartGroceryPoLines.header_id, header.id))
        .orderBy(flipkartGroceryPoLines.line_number);
      
      result.push({
        ...header,
        poLines: lines
      });
    }
    
    return result;
  }

  async getFlipkartGroceryPoById(id: number): Promise<(FlipkartGroceryPoHeader & { poLines: FlipkartGroceryPoLines[] }) | undefined> {
    const [header] = await db.select().from(flipkartGroceryPoHeader).where(eq(flipkartGroceryPoHeader.id, id));
    
    if (!header) {
      return undefined;
    }
    
    const lines = await db.select().from(flipkartGroceryPoLines)
      .where(eq(flipkartGroceryPoLines.header_id, id))
      .orderBy(flipkartGroceryPoLines.line_number);
    
    return {
      ...header,
      poLines: lines
    };
  }

  async getFlipkartGroceryPoByNumber(poNumber: string): Promise<FlipkartGroceryPoHeader | undefined> {
    const [header] = await db.select().from(flipkartGroceryPoHeader).where(eq(flipkartGroceryPoHeader.po_number, poNumber));
    return header || undefined;
  }

  private async insertIntoPoMasterAndLines(
    tx: any,
    platformName: string,
    platformHeader: any,
    platformLines: any[]
  ): Promise<void> {
    try {
      console.log(`📋 Inserting ${platformName} PO ${platformHeader.po_number || 'Unknown'} into po_master and po_lines tables`);

      // Utility function to safely parse dates
      const safeParseDate = (dateValue: any, allowNull: boolean = true): Date | null => {
        try {
          if (!dateValue) return allowNull ? null : new Date();

          // If it's already a Date object, return it
          if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? (allowNull ? null : new Date()) : dateValue;
          }

          // If it's a string, parse it
          if (typeof dateValue === 'string') {
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? (allowNull ? null : new Date()) : date;
          }

          // For any other type, try to convert to Date
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? (allowNull ? null : new Date()) : date;
        } catch (error) {
          console.error(`❌ safeParseDate error for value:`, dateValue, error);
          return allowNull ? null : new Date();
        }
      };

      // Get platform ID from pf_mst table, create if it doesn't exist
      let platformResult = await tx.select()
        .from(pfMst)
        .where(eq(pfMst.pf_name, platformName))
        .limit(1);

      let platformId: number;

      if (platformResult.length === 0) {
        console.log(`⚠️ Platform '${platformName}' not found in pf_mst table, creating it...`);
        try {
          const newPlatform = await tx.insert(pfMst).values({ pf_name: platformName }).returning();
          platformId = newPlatform[0].id;
          console.log(`✅ Created new platform '${platformName}' with ID: ${platformId}`);
        } catch (platformError) {
          console.error(`❌ Error creating platform '${platformName}':`, platformError);
          console.log(`🔄 Attempting to fetch platform again in case it was created by another process...`);
          platformResult = await tx.select()
            .from(pfMst)
            .where(eq(pfMst.pf_name, platformName))
            .limit(1);

          if (platformResult.length === 0) {
            console.error(`❌ Still cannot find platform '${platformName}', skipping po_master insertion`);
            return;
          }
          platformId = platformResult[0].id;
          console.log(`✅ Found existing platform '${platformName}' with ID: ${platformId}`);
        }
      } else {
        platformId = platformResult[0].id;
        console.log(`✅ Found platform '${platformName}' with ID: ${platformId}`);
      }

      // Ensure default distributor exists
      let distributorId = 1;
      try {
        const existingDistributors = await tx.select().from(distributorMst).limit(1);
        if (existingDistributors.length === 0) {
          console.log(`📋 No distributors found, creating default distributor...`);
          const newDistributor = await tx.insert(distributorMst).values({
            distributor_name: 'Default Distributor',
            distributor_code: 'DEFAULT',
            contact_person: 'System Admin',
            phone: '000-000-0000',
            email: 'admin@system.com',
            address: 'Default Address',
            city: 'Default City',
            state: 'Default State',
            pincode: '000000'
          }).returning();
          distributorId = newDistributor[0].id;
          console.log(`✅ Created default distributor with ID: ${distributorId}`);
        } else {
          distributorId = existingDistributors[0].id;
          console.log(`✅ Using existing distributor ID: ${distributorId}`);
        }
      } catch (distError) {
        console.warn(`⚠️ Error handling distributor: ${distError}. Using fallback ID 1`);
        distributorId = 1;
      }

      // Map platform header to po_master format
      const poMasterData = {
        platform_id: platformId,
        vendor_po_number: platformHeader.po_number || platformHeader.vendor_po_number || `${platformName}_${Date.now()}`,
        distributor_id: distributorId,
        series: platformName,
        company_id: 1, // Default company ID - this should be configurable
        po_date: safeParseDate(platformHeader.po_date || platformHeader.created_at, false) as Date,
        delivery_date: safeParseDate(platformHeader.po_delivery_date || platformHeader.delivery_date),
        status_id: 1, // Default status - this should be configurable
        state_id: null, // Can be mapped from platform data if available
        district_id: null, // Can be mapped from platform data if available
        region: null,
        area: null,
        ware_house: null,
        invoice_date: null,
        appointment_date: safeParseDate(platformHeader.appointment_date),
        expiry_date: safeParseDate(platformHeader.po_expiry_date || platformHeader.expiry_date),
        created_by: platformHeader.created_by || platformHeader.uploaded_by || 'system'
      };

      // Insert into po_master
      console.log(`📊 Attempting to insert po_master data:`, {
        vendor_po_number: poMasterData.vendor_po_number,
        platform_id: poMasterData.platform_id,
        po_date: poMasterData.po_date,
        delivery_date: poMasterData.delivery_date,
        appointment_date: poMasterData.appointment_date,
        expiry_date: poMasterData.expiry_date,
        distributor_id: poMasterData.distributor_id,
        company_id: poMasterData.company_id
      });

      // Debug: Check all date fields before insertion
      Object.keys(poMasterData).forEach(key => {
        const value = (poMasterData as any)[key];
        if (key.includes('date') || key.includes('Date')) {
          console.log(`🔍 Date field ${key}:`, {
            value,
            type: typeof value,
            isDate: value instanceof Date,
            hasToISOString: value && typeof value.toISOString === 'function'
          });
        }
      });

      let poMasterId: number;
      try {
        const createdPoMaster = await tx.insert(poMaster).values(poMasterData).returning();
        poMasterId = createdPoMaster[0].id;
        console.log(`✅ Created po_master record with ID: ${poMasterId}`);
      } catch (poMasterError) {
        console.error(`❌ CRITICAL: Error inserting into po_master table:`, poMasterError);
        console.error(`❌ poMasterData that caused the error:`, JSON.stringify(poMasterData, null, 2));
        throw poMasterError; // Re-throw to see the full error chain
      }

      // Process each line item
      if (platformLines && platformLines.length > 0) {
        console.log(`📦 Processing ${platformLines.length} line items for po_lines table`);

        for (const line of platformLines) {
          let platformProductCodeId: number;

          // Determine the product code to search for - handle different platform naming conventions
          const productCode = line.item_code || line.sku_code || line.article_id || line.platform_code || line.sap_code || line.product_number || line.sku || `${platformName}_${Date.now()}`;
          const productName = line.product_description || line.title || line.item_description || line.article_name || line.item_name || line.description || line.product_name || `${platformName} Product`;

          // Check if item exists in pf_item_mst for this platform
          const existingItem = await tx.select()
            .from(pfItemMst)
            .where(and(
              eq(pfItemMst.pf_id, platformId),
              eq(pfItemMst.pf_itemcode, productCode)
            ))
            .limit(1);

          if (existingItem.length > 0) {
            platformProductCodeId = existingItem[0].id;
            console.log(`✅ Found existing product in pf_item_mst: ${productCode} (ID: ${platformProductCodeId})`);
          } else {
            // Create new item in pf_item_mst
            console.log(`🔍 Creating new pf_item_mst entry for: ${productCode}`);

            const newPfItem = {
              pf_itemcode: productCode,
              pf_itemname: productName,
              pf_id: platformId,
              sap_id: productCode // Store product code as sap_id for now
            };

            const createdPfItem = await tx.insert(pfItemMst).values(newPfItem).returning();
            platformProductCodeId = createdPfItem[0].id;
            console.log(`✅ Created new pf_item_mst entry with ID: ${platformProductCodeId}`);
          }

          // Map line to po_lines format
          const poLineData = {
            po_id: poMasterId,
            platform_product_code_id: platformProductCodeId,
            quantity: line.quantity ? line.quantity.toString() : '0',
            basic_amount: line.basic_cost_price || line.basic_cost || line.base_cost_price || line.unit_base_cost || line.basic_amount || '0',
            tax: line.tax_amount || line.igst_amount || line.gst_amount || '0',
            landing_amount: line.landing_rate || line.landing_amount || '0',
            total_amount: line.total_amount || '0',
            uom: line.uom || null,
            total_liter: null,
            status: 'active'
          };

          // Insert into po_lines
          console.log(`📦 Inserting po_lines data for product ${productCode}:`, {
            po_id: poLineData.po_id,
            platform_product_code_id: poLineData.platform_product_code_id,
            quantity: poLineData.quantity,
            basic_amount: poLineData.basic_amount,
            total_amount: poLineData.total_amount
          });

          await tx.insert(poLines).values(poLineData);
          console.log(`✅ Successfully inserted po_lines record for product ${productCode}`);
        }

        console.log(`✅ Successfully inserted ${platformLines.length} line items into po_lines table`);
      }

      console.log(`✅ Successfully completed po_master and po_lines insertion for ${platformName} PO ${platformHeader.po_number}`);

    } catch (error) {
      console.error(`❌ Error inserting ${platformName} PO into po_master/po_lines:`, error);
      console.error(`❌ Error details:`, {
        platformName,
        platformHeaderKeys: Object.keys(platformHeader || {}),
        platformLinesLength: platformLines?.length || 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      // Don't throw error to avoid breaking the main transaction - just log it
    }
  }

  async createFlipkartGroceryPo(header: InsertFlipkartGroceryPoHeader, lines: InsertFlipkartGroceryPoLines[]): Promise<FlipkartGroceryPoHeader> {
    console.log('💾 Storage: Starting createFlipkartGroceryPo operation');
    console.log('💾 Storage: Header PO number:', header.po_number);
    console.log('💾 Storage: Lines count:', lines.length);

    try {
      // SIMPLIFIED APPROACH: Direct insertion without consolidated tables
      console.log('💾 Storage: Using simplified insertion approach');

      return await db.transaction(async (tx) => {
        console.log('💾 Storage: Transaction started for Flipkart PO');

        // Step 1: Insert header
        console.log('💾 Storage: Step 1 - Inserting header into flipkart_grocery_po_header...');
        console.log('💾 Storage: Header data keys:', Object.keys(header));

        const [createdHeader] = await tx.insert(flipkartGroceryPoHeader).values(header).returning();
        console.log('💾 Storage: ✅ Header inserted successfully with ID:', createdHeader.id);

        // Step 2: Insert lines if any
        if (lines.length > 0) {
          console.log('💾 Storage: Step 2 - Preparing lines for insertion...');

          const linesWithHeaderId = lines.map((line, index) => {
            console.log(`💾 Storage: Preparing line ${index + 1}:`, line.title || 'Unknown item');
            return {
              ...line,
              header_id: createdHeader.id
            };
          });

          console.log('💾 Storage: Inserting', linesWithHeaderId.length, 'lines into flipkart_grocery_po_lines...');
          const insertedLines = await tx.insert(flipkartGroceryPoLines).values(linesWithHeaderId).returning();
          console.log('💾 Storage: ✅ Lines inserted successfully, count:', insertedLines.length);
        } else {
          console.log('💾 Storage: Step 2 - No lines to insert');
        }

        console.log('💾 Storage: ✅ Transaction completed successfully');
        console.log('💾 Storage: Final header ID:', createdHeader.id, 'PO Number:', createdHeader.po_number);

        // Explicit verification within transaction
        console.log('💾 Storage: Verifying insertion within transaction...');
        const verification = await tx.select().from(flipkartGroceryPoHeader).where(eq(flipkartGroceryPoHeader.id, createdHeader.id));
        if (verification.length > 0) {
          console.log('💾 Storage: ✅ Verification successful - header exists in transaction');
        } else {
          console.log('💾 Storage: ❌ Verification failed - header not found in transaction');
          throw new Error('Header verification failed within transaction');
        }

        return createdHeader;
      });
    } catch (error) {
      console.error('💾 Storage: ❌ Transaction failed with error:', error);
      console.error('💾 Storage: Error type:', typeof error);
      console.error('💾 Storage: Error details:', error instanceof Error ? error.message : String(error));
      console.error('💾 Storage: Error code:', (error as any)?.code);
      console.error('💾 Storage: Error constraint:', (error as any)?.constraint);
      console.error('💾 Storage: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  async updateFlipkartGroceryPo(id: number, header: Partial<InsertFlipkartGroceryPoHeader>, lines?: InsertFlipkartGroceryPoLines[]): Promise<FlipkartGroceryPoHeader> {
    return await db.transaction(async (tx) => {
      const [updatedHeader] = await tx.update(flipkartGroceryPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(flipkartGroceryPoHeader.id, id))
        .returning();

      if (lines) {
        // Delete existing lines
        await tx.delete(flipkartGroceryPoLines).where(eq(flipkartGroceryPoLines.header_id, id));
        
        // Insert new lines
        if (lines.length > 0) {
          const linesWithHeaderId = lines.map(line => ({
            ...line,
            header_id: id
          }));
          await tx.insert(flipkartGroceryPoLines).values(linesWithHeaderId);
        }
      }

      return updatedHeader;
    });
  }

  async deleteFlipkartGroceryPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all related po lines
      await tx.delete(flipkartGroceryPoLines).where(eq(flipkartGroceryPoLines.header_id, id));
      
      // Then delete the PO header
      await tx.delete(flipkartGroceryPoHeader).where(eq(flipkartGroceryPoHeader.id, id));
    });
  }

  async getFlipkartGroceryPoLines(poHeaderId: number): Promise<FlipkartGroceryPoLines[]> {
    return await db.select().from(flipkartGroceryPoLines)
      .where(eq(flipkartGroceryPoLines.header_id, poHeaderId))
      .orderBy(flipkartGroceryPoLines.line_number);
  }

  // Zepto PO methods
  async getAllZeptoPos(): Promise<(ZeptoPoHeader & { poLines: ZeptoPoLines[] })[]> {
    const headers = await db.select().from(zeptoPoHeader).orderBy(desc(zeptoPoHeader.created_at));
    
    const result = [];
    for (const header of headers) {
      const lines = await db.select().from(zeptoPoLines)
        .where(eq(zeptoPoLines.po_header_id, header.id))
        .orderBy(zeptoPoLines.line_number);
      
      result.push({
        ...header,
        poLines: lines
      });
    }
    
    return result;
  }

  async getZeptoPOById(id: number): Promise<(ZeptoPoHeader & { poLines: ZeptoPoLines[] }) | undefined> {
    const [header] = await db.select().from(zeptoPoHeader).where(eq(zeptoPoHeader.id, id));
    if (!header) return undefined;

    const lines = await db.select().from(zeptoPoLines)
      .where(eq(zeptoPoLines.po_header_id, header.id))
      .orderBy(zeptoPoLines.line_number);

    return {
      ...header,
      poLines: lines
    };
  }

  async getZeptoPoByNumber(poNumber: string): Promise<ZeptoPoHeader | undefined> {
    const [header] = await db.select().from(zeptoPoHeader).where(eq(zeptoPoHeader.po_number, poNumber));
    return header || undefined;
  }

  async createZeptoPo(header: InsertZeptoPoHeader, lines: InsertZeptoPoLines[]): Promise<ZeptoPoHeader> {
    console.log('📋 Creating Zepto PO:', header.po_number, 'with', lines.length, 'lines');
    return await db.transaction(async (tx) => {
      // Insert into platform-specific tables
      const [createdHeader] = await tx.insert(zeptoPoHeader).values(header).returning();
      console.log('✅ Created zepto_po_header ID:', createdHeader.id);
      
      if (lines.length > 0) {
        const linesWithHeaderId = lines.map(line => ({
          ...line,
          po_header_id: createdHeader.id
        }));
        await tx.insert(zeptoPoLines).values(linesWithHeaderId);
        
        // Also insert into consolidated po_master and po_lines tables
        console.log('📊 Inserting into po_master and po_lines tables...');
        await this.insertIntoPoMasterAndLines(tx, 'Zepto', createdHeader, linesWithHeaderId);
        console.log('✅ Successfully inserted into ALL tables!');
      } else {
        // Insert header only into po_master
        await this.insertIntoPoMasterAndLines(tx, 'Zepto', createdHeader, []);
      }
      
      return createdHeader;
    });
  }

  async updateZeptoPo(id: number, header: Partial<InsertZeptoPoHeader>, lines?: InsertZeptoPoLines[]): Promise<ZeptoPoHeader> {
    return await db.transaction(async (tx) => {
      // Update header
      const [updatedHeader] = await tx
        .update(zeptoPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(zeptoPoHeader.id, id))
        .returning();

      // Update lines if provided
      if (lines) {
        // Delete existing lines
        await tx.delete(zeptoPoLines).where(eq(zeptoPoLines.po_header_id, id));
        
        // Insert new lines
        if (lines.length > 0) {
          const linesWithHeaderId = lines.map(line => ({
            ...line,
            po_header_id: id
          }));
          
          await tx.insert(zeptoPoLines).values(linesWithHeaderId);
        }
      }

      return updatedHeader;
    });
  }

  async deleteZeptoPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all related po lines
      await tx.delete(zeptoPoLines).where(eq(zeptoPoLines.po_header_id, id));
      
      // Then delete the PO header
      await tx.delete(zeptoPoHeader).where(eq(zeptoPoHeader.id, id));
    });
  }

  async getZeptoPoLines(poHeaderId: number): Promise<ZeptoPoLines[]> {
    return await db.select().from(zeptoPoLines)
      .where(eq(zeptoPoLines.po_header_id, poHeaderId))
      .orderBy(zeptoPoLines.line_number);
  }

  // City Mall PO methods
  async getAllCityMallPos(): Promise<(CityMallPoHeader & { poLines: CityMallPoLines[] })[]> {
    const pos = await db.select().from(cityMallPoHeader).orderBy(desc(cityMallPoHeader.created_at));
    
    const posWithLines = await Promise.all(
      pos.map(async (po) => {
        const lines = await db.select().from(cityMallPoLines).where(eq(cityMallPoLines.po_header_id, po.id));
        return { ...po, poLines: lines };
      })
    );
    
    return posWithLines;
  }

  async getCityMallPoById(id: number): Promise<(CityMallPoHeader & { poLines: CityMallPoLines[] }) | undefined> {
    const [po] = await db.select().from(cityMallPoHeader).where(eq(cityMallPoHeader.id, id));
    if (!po) return undefined;
    
    const lines = await db.select().from(cityMallPoLines).where(eq(cityMallPoLines.po_header_id, id));
    return { ...po, poLines: lines };
  }

  async createCityMallPo(header: InsertCityMallPoHeader, lines: InsertCityMallPoLines[]): Promise<CityMallPoHeader> {
    console.log('💾 CityMall Storage: Using DIRECT SQL approach (bypassing Drizzle transactions)');
    console.log('📋 CityMall Header to insert:', JSON.stringify(header, null, 2));
    console.log('📝 CityMall Lines to insert:', lines.length, 'items');

    // Get raw connection pool for direct SQL
    const pool = (db as any)._.session.client;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      console.log('💾 Direct SQL transaction started');

      // Insert header using direct SQL
      console.log('💾 Inserting CityMall header with direct SQL...');
      const headerInsertQuery = `
        INSERT INTO city_mall_po_header (
          po_number, po_date, po_expiry_date, vendor_name, vendor_gstin, vendor_code,
          status, total_quantity, total_base_amount, total_igst_amount, total_cess_amount,
          total_amount, unique_hsn_codes, created_by, uploaded_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const headerValues = [
        header.po_number,
        header.po_date || null,
        header.po_expiry_date || null,
        header.vendor_name || null,
        header.vendor_gstin || null,
        header.vendor_code || null,
        header.status || 'Open',
        header.total_quantity || 0,
        header.total_base_amount || '0.00',
        header.total_igst_amount || '0.00',
        header.total_cess_amount || '0.00',
        header.total_amount || '0.00',
        header.unique_hsn_codes || null,
        header.created_by || 'system',
        header.uploaded_by || null,
        new Date(),
        new Date()
      ];

      const headerResult = await client.query(headerInsertQuery, headerValues);
      const createdHeader = headerResult.rows[0];
      console.log('✅ CityMall Header inserted with ID:', createdHeader.id);

      // Insert lines if any
      if (lines.length > 0) {
        console.log('💾 Inserting CityMall lines with direct SQL...');

        for (const line of lines) {
          const lineInsertQuery = `
            INSERT INTO city_mall_po_lines (
              po_header_id, line_number, article_id, article_name, hsn_code,
              mrp, base_cost_price, quantity, base_amount, igst_percent,
              cess_percent, igst_amount, cess_amount, total_amount,
              status, created_by, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          `;

          const lineValues = [
            createdHeader.id,
            line.line_number || 1,
            line.article_id || null,
            line.article_name || null,
            line.hsn_code || null,
            line.mrp || null,
            line.base_cost_price || null,
            line.quantity || 0,
            line.base_amount || null,
            line.igst_percent || null,
            line.cess_percent || null,
            line.igst_amount || null,
            line.cess_amount || null,
            line.total_amount || null,
            line.status || 'Pending',
            line.created_by || 'system',
            new Date()
          ];

          await client.query(lineInsertQuery, lineValues);
        }

        console.log('✅ CityMall Lines inserted:', lines.length, 'items');
      }

      // Verify insertion within transaction
      console.log('🔍 Verifying CityMall insertion within direct SQL transaction...');
      const verificationResult = await client.query(
        'SELECT id, po_number, vendor_name FROM city_mall_po_header WHERE id = $1',
        [createdHeader.id]
      );

      if (verificationResult.rows.length > 0) {
        console.log('✅ Verification successful - CityMall header exists in transaction');
        console.log('📋 Verified data:', verificationResult.rows[0]);
      } else {
        throw new Error('CityMall header verification failed within transaction');
      }

      await client.query('COMMIT');
      console.log('🎉 Direct SQL transaction committed successfully');

      // Final verification after commit
      console.log('🔍 Final verification after commit...');
      const finalVerificationResult = await client.query(
        'SELECT * FROM city_mall_po_header WHERE id = $1',
        [createdHeader.id]
      );

      if (finalVerificationResult.rows.length > 0) {
        console.log('✅ Final verification successful - data persisted after commit');
        return finalVerificationResult.rows[0] as CityMallPoHeader;
      } else {
        throw new Error('CityMall data not found after commit - rollback occurred');
      }

    } catch (error) {
      console.error('❌ Direct SQL CityMall Storage Error:', error);
      try {
        await client.query('ROLLBACK');
        console.log('🔄 Direct SQL transaction rolled back');
      } catch (rollbackError) {
        console.error('⚠️ Rollback failed:', rollbackError);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async updateCityMallPo(id: number, header: Partial<InsertCityMallPoHeader>, lines?: InsertCityMallPoLines[]): Promise<CityMallPoHeader> {
    return await db.transaction(async (tx) => {
      const [updatedHeader] = await tx
        .update(cityMallPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(cityMallPoHeader.id, id))
        .returning();
      
      if (lines) {
        await tx.delete(cityMallPoLines).where(eq(cityMallPoLines.po_header_id, id));
        if (lines.length > 0) {
          const linesWithHeaderId = lines.map(line => ({
            ...line,
            po_header_id: id
          }));
          await tx.insert(cityMallPoLines).values(linesWithHeaderId);
        }
      }
      
      return updatedHeader;
    });
  }

  async deleteCityMallPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all related po lines
      await tx.delete(cityMallPoLines).where(eq(cityMallPoLines.po_header_id, id));
      
      // Then delete the PO header
      await tx.delete(cityMallPoHeader).where(eq(cityMallPoHeader.id, id));
    });
  }

  async getCityMallPoByNumber(poNumber: string): Promise<CityMallPoHeader | undefined> {
    const [header] = await db.select().from(cityMallPoHeader).where(eq(cityMallPoHeader.po_number, poNumber));
    return header || undefined;
  }

  async getCityMallPoLines(poHeaderId: number): Promise<CityMallPoLines[]> {
    return await db.select().from(cityMallPoLines)
      .where(eq(cityMallPoLines.po_header_id, poHeaderId))
      .orderBy(cityMallPoLines.line_number);
  }

  // Blinkit PO methods
  async getAllBlinkitPos(): Promise<(BlinkitPoHeader & { poLines: BlinkitPoLines[] })[]> {
    try {
      // Use raw SQL to avoid schema issues
      const posResult = await db.execute(sql`
        SELECT * FROM blinkit_po_header
      `);
      const pos = posResult.rows as any[];

      const posWithLines = await Promise.all(
        pos.map(async (po) => {
          const linesResult = await db.execute(sql`
            SELECT * FROM blinkit_po_lines WHERE header_id = ${po.id}
          `);
          const lines = linesResult.rows as any[];
          return { ...po, poLines: lines };
        })
      );

      return posWithLines;
    } catch (error) {
      console.error('Error in getAllBlinkitPos:', error);
      throw error;
    }
  }

  async getBlinkitPoById(id: number): Promise<(BlinkitPoHeader & { poLines: BlinkitPoLines[] }) | undefined> {
    const [po] = await db.select().from(blinkitPoHeader).where(eq(blinkitPoHeader.id, id));
    if (!po) return undefined;

    const lines = await db.select().from(blinkitPoLines).where(eq(blinkitPoLines.header_id, id));
    return { ...po, poLines: lines };
  }

  async createBlinkitPo(header: any, lines: any[]): Promise<any> {
    return await db.transaction(async (tx) => {
      // Calculate totals from lines
      const totalItems = lines.length;
      const totalQuantity = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
      const totalAmount = lines.reduce((sum, line) => sum + (Number(line.total_amount) || 0), 0);

      // Insert into blinkit_po_header with actual database structure
      const createdHeaderResult = await tx.execute(sql`
        INSERT INTO blinkit_po_header (
          po_number, po_date, po_type, currency, buyer_name, buyer_pan, buyer_cin, buyer_unit,
          buyer_contact_name, buyer_contact_phone, vendor_no, vendor_name, vendor_pan, vendor_gst_no,
          vendor_registered_address, vendor_contact_name, vendor_contact_phone, vendor_contact_email,
          delivered_by, delivered_to_company, delivered_to_address, delivered_to_gst_no,
          spoc_name, spoc_phone, spoc_email, payment_terms, po_expiry_date, po_delivery_date,
          total_quantity, total_items, total_weight, total_amount, cart_discount, net_amount
        ) VALUES (
          ${header.po_number || `BLINKIT_PO_${Date.now()}`},
          ${header.po_date || null},
          ${header.po_type || null},
          ${header.currency || null},
          ${header.buyer_name || null},
          ${header.buyer_pan || null},
          ${header.buyer_cin || null},
          ${header.buyer_unit || null},
          ${header.buyer_contact_name || null},
          ${header.buyer_contact_phone || null},
          ${header.vendor_no || null},
          ${header.vendor_name || null},
          ${header.vendor_pan || null},
          ${header.vendor_gst_no || null},
          ${header.vendor_registered_address || null},
          ${header.vendor_contact_name || null},
          ${header.vendor_contact_phone || null},
          ${header.vendor_contact_email || null},
          ${header.delivered_by || null},
          ${header.delivered_to_company || null},
          ${header.delivered_to_address || null},
          ${header.delivered_to_gst_no || null},
          ${header.spoc_name || null},
          ${header.spoc_phone || null},
          ${header.spoc_email || null},
          ${header.payment_terms || null},
          ${header.po_expiry_date || null},
          ${header.po_delivery_date || null},
          ${totalQuantity},
          ${totalItems},
          ${header.total_weight || null},
          ${totalAmount.toString()},
          ${header.cart_discount || '0'},
          ${(totalAmount - (Number(header.cart_discount) || 0)).toString()}
        ) RETURNING id, po_number
      `);

      const createdHeader = createdHeaderResult.rows[0];

      // Insert lines into blinkit_po_lines with actual database structure
      if (lines.length > 0) {
        for (const line of lines) {
          await tx.execute(sql`
            INSERT INTO blinkit_po_lines (
              header_id, item_code, hsn_code, product_upc, product_description,
              basic_cost_price, igst_percent, cess_percent, addt_cess, tax_amount,
              landing_rate, quantity, mrp, margin_percent, total_amount
            ) VALUES (
              ${createdHeader.id},
              ${line.item_code || ''},
              ${line.hsn_code || ''},
              ${line.product_upc || ''},
              ${line.product_description || ''},
              ${line.basic_cost_price || '0'},
              ${line.igst_percent || '0'},
              ${line.cess_percent || '0'},
              ${line.addt_cess || '0'},
              ${line.tax_amount || '0'},
              ${line.landing_rate || '0'},
              ${line.quantity || 0},
              ${line.mrp || '0'},
              ${line.margin_percent || '0'},
              ${line.total_amount || '0'}
            )
          `);
        }
      }

      return createdHeader;
    });
  }

  async updateBlinkitPo(id: number, header: Partial<InsertBlinkitPoHeader>, lines?: InsertBlinkitPoLines[]): Promise<BlinkitPoHeader> {
    return await db.transaction(async (tx) => {
      const [updatedHeader] = await tx
        .update(blinkitPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(blinkitPoHeader.id, id))
        .returning();
      
      if (lines) {
        await tx.delete(blinkitPoLines).where(eq(blinkitPoLines.header_id, id));
        if (lines.length > 0) {
          const linesWithHeaderId = lines.map(line => ({
            ...line,
            po_header_id: id
          }));
          await tx.insert(blinkitPoLines).values(linesWithHeaderId);
        }
      }
      
      return updatedHeader;
    });
  }

  async deleteBlinkitPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all related po lines
      await tx.delete(blinkitPoLines).where(eq(blinkitPoLines.header_id, id));
      
      // Then delete the PO header
      await tx.delete(blinkitPoHeader).where(eq(blinkitPoHeader.id, id));
    });
  }

  async getBlinkitPoByNumber(poNumber: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT id, po_number FROM blinkit_po_header WHERE po_number = ${poNumber} LIMIT 1
    `);
    return result.rows[0] || undefined;
  }

  async getBlinkitPoLines(poHeaderId: number): Promise<BlinkitPoLines[]> {
    return await db.select().from(blinkitPoLines)
      .where(eq(blinkitPoLines.header_id, poHeaderId));
  }

  // Swiggy PO methods
  async getAllSwiggyPos(): Promise<(SwiggyPo & { poLines: SwiggyPoLine[] })[]> {
    const pos = await db
      .select()
      .from(swiggyPos)
      .orderBy(desc(swiggyPos.created_at));

    return await Promise.all(
      pos.map(async (po) => {
        const lines = await db
          .select()
          .from(swiggyPoLines)
          .where(eq(swiggyPoLines.po_id, po.id))
          .orderBy(swiggyPoLines.line_number);
        return { ...po, poLines: lines };
      })
    );
  }

  async getSwiggyPoById(id: number): Promise<(SwiggyPo & { poLines: SwiggyPoLine[] }) | undefined> {
    const [po] = await db
      .select()
      .from(swiggyPos)
      .where(eq(swiggyPos.id, id));

    if (!po) return undefined;

    const lines = await db
      .select()
      .from(swiggyPoLines)
      .where(eq(swiggyPoLines.po_id, po.id))
      .orderBy(swiggyPoLines.line_number);

    return { ...po, poLines: lines };
  }

  async getSwiggyPoByNumber(poNumber: string): Promise<SwiggyPo | undefined> {
    const [po] = await db
      .select()
      .from(swiggyPos)
      .where(eq(swiggyPos.po_number, poNumber));

    return po || undefined;
  }

  async createSwiggyPo(po: InsertSwiggyPo, lines: InsertSwiggyPoLine[]): Promise<SwiggyPo> {
    return await db.transaction(async (tx) => {
      // Insert into platform-specific tables
      const [createdPo] = await tx.insert(swiggyPos).values(po).returning();
      
      if (lines.length > 0) {
        const linesWithPoId = lines.map(line => ({ ...line, po_id: createdPo.id }));
        await tx.insert(swiggyPoLines).values(linesWithPoId);
        
        // Also insert into consolidated po_master and po_lines tables
        await this.insertIntoPoMasterAndLines(tx, 'Swiggy', createdPo, linesWithPoId);
      } else {
        // Insert header only into po_master
        await this.insertIntoPoMasterAndLines(tx, 'Swiggy', createdPo, []);
      }
      
      return createdPo;
    });
  }

  async updateSwiggyPo(id: number, po: Partial<InsertSwiggyPo>): Promise<SwiggyPo | undefined> {
    const [updated] = await db
      .update(swiggyPos)
      .set({ ...po, updated_at: new Date() })
      .where(eq(swiggyPos.id, id))
      .returning();
    return updated;
  }

  async deleteSwiggyPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all related po lines
      await tx.delete(swiggyPoLines).where(eq(swiggyPoLines.po_id, id));
      
      // Then delete the PO header
      await tx.delete(swiggyPos).where(eq(swiggyPos.id, id));
    });
  }

  async getSwiggyPoLines(poId: number): Promise<SwiggyPoLine[]> {
    return await db.select().from(swiggyPoLines)
      .where(eq(swiggyPoLines.po_id, poId))
      .orderBy(swiggyPoLines.line_number);
  }

  // Distributor methods
  async getAllDistributors(): Promise<DistributorMst[]> {
    console.log('🔍 getAllDistributors: Fetching from distributor_mst table...');

    try {
      const result = await db.select().from(distributorMst).orderBy(distributorMst.distributor_name);
      console.log(`✅ getAllDistributors: Found ${result.length} distributors:`, result.map(d => d.distributor_name));
      return result;
    } catch (error) {
      console.error('❌ getAllDistributors: Error fetching distributors:', error);
      throw error;
    }
  }

  async getDistributorById(id: number): Promise<DistributorMst | undefined> {
    const [distributor] = await db.select().from(distributorMst).where(eq(distributorMst.id, id));
    return distributor || undefined;
  }

  async getDistributorByName(name: string): Promise<DistributorMst | undefined> {
    const [distributor] = await db.select().from(distributorMst)
      .where(eq(distributorMst.distributor_name, name));
    return distributor || undefined;
  }

  async createDistributor(distributor: InsertDistributorMst): Promise<DistributorMst> {
    const [result] = await db.insert(distributorMst).values(distributor).returning();
    return result;
  }

  async updateDistributor(id: number, distributor: Partial<InsertDistributorMst>): Promise<DistributorMst> {
    const [result] = await db
      .update(distributorMst)
      .set({ ...distributor, updated_at: new Date() })
      .where(eq(distributorMst.id, id))
      .returning();
    return result;
  }

  async deleteDistributor(id: number): Promise<void> {
    await db.delete(distributorMst).where(eq(distributorMst.id, id));
  }

  // State and District methods for dynamic dropdowns (using original tables)
  async getAllStates(): Promise<States[]> {
    return await db.select().from(states).orderBy(states.statename);
  }

  async getDistrictsByStateId(stateId: number): Promise<Districts[]> {
    return await db.select().from(districts).where(eq(districts.state_id, stateId)).orderBy(districts.district);
  }

  async getAllDistributorsFromOriginalTable(): Promise<Distributors[]> {
    return await db.select().from(distributors).orderBy(distributors.name);
  }

  // Three-level cascading: regions → states → districts
  async getAllRegions(): Promise<{ id: number; region_name: string }[]> {
    console.log('🌍 Storage: Fetching all regions');
    
    try {
      // Try to get from regions table first
      const result = await db.select().from(regions).where(eq(regions.status, 'Active')).orderBy(regions.region_name);
      console.log(`🌍 Storage: Found ${result.length} regions from table:`, result.map(r => r.region_name));
      return result;
    } catch (error) {
      console.log('🌍 Storage: Regions table not found, using hardcoded regions');
      // Fallback to hardcoded regions if table doesn't exist
      return [
        { id: 1, region_name: 'NORTH INDIA' },
        { id: 2, region_name: 'SOUTH INDIA' },
        { id: 3, region_name: 'WEST INDIA' },
        { id: 4, region_name: 'EAST INDIA' },
        { id: 5, region_name: 'CENTRAL INDIA' }
      ];
    }
  }

  async getStatesByRegion(regionId: number): Promise<{ id: number; state_name: string; region_id: number }[]> {
    console.log(`🏛️ Storage: Fetching states for region ID: ${regionId}`);
    
    // Define region-state mapping since region_id might not exist in states table
    const regionStateMapping: Record<number, string[]> = {
      1: ['DELHI', 'HARYANA', 'PUNJAB', 'HIMACHAL PRADESH', 'UTTAR PRADESH', 'UTTARAKHAND', 'JAMMU AND KASHMIR', 'LADAKH', 'CHANDIGARH'], // NORTH INDIA
      2: ['KARNATAKA', 'TAMIL NADU', 'KERALA', 'ANDHRA PRADESH', 'TELANGANA', 'PUDUCHERRY'], // SOUTH INDIA  
      3: ['MAHARASHTRA', 'GUJARAT', 'RAJASTHAN', 'GOA', 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU'], // WEST INDIA
      4: ['WEST BENGAL', 'ODISHA', 'BIHAR', 'JHARKHAND', 'ASSAM', 'MEGHALAYA', 'MANIPUR', 'MIZORAM', 'NAGALAND', 'TRIPURA', 'ARUNACHAL PRADESH', 'SIKKIM'], // EAST INDIA
      5: ['MADHYA PRADESH', 'CHHATTISGARH'] // CENTRAL INDIA
    };
    
    const regionNames = ['', 'NORTH INDIA', 'SOUTH INDIA', 'WEST INDIA', 'EAST INDIA', 'CENTRAL INDIA'];
    const regionName = regionNames[regionId] || 'UNKNOWN';
    
    console.log(`🏛️ Storage: Mapping states for region: ${regionName}`);
    
    const stateNamesForRegion = regionStateMapping[regionId] || [];
    
    if (stateNamesForRegion.length === 0) {
      console.log(`❌ Storage: No states mapped for region ID ${regionId}`);
      return [];
    }
    
    try {
      // Try to filter by region_id first if it exists
      const resultByRegionId = await db.select().from(states).where(eq(states.region_id, regionId)).orderBy(states.statename);
      
      if (resultByRegionId.length > 0) {
        console.log(`🏛️ Storage: Found ${resultByRegionId.length} states using region_id for ${regionName}`);
        return resultByRegionId.map(state => ({
          id: state.id,
          state_name: state.statename,
          region_id: regionId
        }));
      }
    } catch (error) {
      console.log('🏛️ Storage: region_id column not found, using name-based filtering');
    }
    
    // Fallback to name-based filtering
    const allStates = await db.select().from(states).orderBy(states.statename);
    const filteredStates = allStates.filter(state => 
      stateNamesForRegion.some(regionStateName => 
        state.statename.toUpperCase().includes(regionStateName.toUpperCase()) ||
        regionStateName.toUpperCase().includes(state.statename.toUpperCase())
      )
    );
    
    console.log(`🏛️ Storage: Found ${filteredStates.length} states for region ${regionName} using name mapping:`, 
      filteredStates.map(s => s.statename));
    
    return filteredStates.map(state => ({
      id: state.id,
      state_name: state.statename,
      region_id: regionId
    }));
  }

  async getDistrictsByStateIdFromMaster(stateId: number): Promise<{ id: number; district_name: string; state_id: number }[]> {
    console.log(`🏘️ Storage: Fetching districts for state ID: ${stateId}`);
    
    // First verify the state exists
    const state = await db.select().from(states).where(eq(states.id, stateId)).limit(1);
    if (state.length === 0) {
      console.log(`❌ Storage: State ID ${stateId} not found`);
      return [];
    }
    
    console.log(`🏘️ Storage: State found: ${state[0].statename}`);
    
    // Get districts for this state
    const result = await db.select().from(districts).where(eq(districts.state_id, stateId)).orderBy(districts.district);
    
    console.log(`🏘️ Storage: Found ${result.length} districts for state ${state[0].statename}:`, 
      result.map(d => d.district));
    
    return result.map(district => ({
      id: district.id,
      district_name: district.district,
      state_id: district.state_id
    }));
  }

  // Status methods
  async getAllStatuses(): Promise<Statuses[]> {
    return await db.select().from(statuses).where(eq(statuses.is_active, true)).orderBy(statuses.status_name);
  }

  async getAllStatusItems(): Promise<StatusItem[]> {
    return await db.select().from(statusItem).where(eq(statusItem.is_active, true)).orderBy(statusItem.status_name);
  }

  // Items methods - using raw SQL to match actual table structure
  async getAllItems(): Promise<any[]> {
    try {
      console.log('📊 getAllItems: Starting to fetch items with raw SQL...');
      const result = await db.execute(sql`
        SELECT itemcode, itemname
        FROM items
        ORDER BY itemname
        LIMIT 1000
      `);
      console.log(`📊 getAllItems (raw SQL): Found ${result.rows.length} items`);

      // Add a simple id for frontend compatibility
      const itemsWithId = result.rows.map((item, index) => ({
        id: index + 1,
        ...item
      }));

      return itemsWithId;
    } catch (error) {
      console.error("Error fetching items from database:", error);
      return [];
    }
  }

  async searchItems(query: string): Promise<any[]> {
    try {
      console.log('🔍 SearchItems V3 - Starting search for:', query);

      // First, let's just count records to see if there's any data
      const countResult = await db.execute(sql`SELECT COUNT(*) as total FROM items`);
      console.log('🔍 Items table count:', countResult.rows[0]);

      const result = await db.execute(sql`
        SELECT itemcode, itemname, itmsgrpnam as itemgroup, u_type as type, u_variety as variety,
               u_sub_group as subgroup, u_brand as brand, invntryuom as uom,
               u_tax_rate as taxrate, salpackun as unitsize, u_islitre as is_litre
        FROM items
        WHERE CAST(itemname AS TEXT) ILIKE ${`%${query}%`}
           OR CAST(itemcode AS TEXT) ILIKE ${`%${query}%`}
        ORDER BY itemname
        LIMIT 10
      `);

      console.log('🔍 SearchItems - Found', result.rows.length, 'items');
      if (result.rows.length > 0) {
        console.log('🔍 Sample item data:', JSON.stringify(result.rows[0], null, 2));
      }

      // Add a simple id for frontend compatibility
      const itemsWithId = result.rows.map((item, index) => ({
        id: index + 1,
        ...item
      }));

      return itemsWithId;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  async getItemByCode(itemcode: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT itemcode, itemname, itmsgrpnam, u_type, u_variety, 
             u_sub_group, u_brand, invntryuom, salpackun, u_islitre, u_tax_rate
      FROM items 
      WHERE itemcode = ${itemcode}
      LIMIT 1
    `);
    return result.rows[0];
  }

  async getItemByName(itemname: string): Promise<any | undefined> {
    const result = await db.execute(sql`
      SELECT itemcode, itemname, itmsgrpnam, u_type, u_variety, 
             u_sub_group, u_brand, invntryuom, salpackun, u_islitre, u_tax_rate
      FROM items 
      WHERE itemname ILIKE ${itemname}
      LIMIT 1
    `);
    return result.rows[0];
  }

  async createItem(item: InsertItems): Promise<Items> {
    const result = await db.insert(items).values(item).returning();
    return result[0];
  }

  async updateItem(itemcode: string, item: Partial<InsertItems>): Promise<Items> {
    const result = await db.update(items)
      .set({ ...item, updated_at: new Date() })
      .where(eq(items.itemcode, itemcode))
      .returning();
    return result[0];
  }

  async createPFItem(data: { pf_id: number; pf_itemcode: string; pf_itemname: string; sap_id: string }): Promise<any> {
    try {
      console.log(`🔍 Storage: Checking for duplicate PF item - Platform: ${data.pf_id}, Code: ${data.pf_itemcode}`);
      
      // STRICT VALIDATION: Check for duplicates by pf_id + pf_itemcode combination
      const existingByCode = await db
        .select()
        .from(pfItemMst)
        .where(and(
          eq(pfItemMst.pf_id, data.pf_id),
          eq(pfItemMst.pf_itemcode, data.pf_itemcode.trim())
        ));
      
      if (existingByCode.length > 0) {
        console.log(`❌ Storage: BLOCKED - PF item code '${data.pf_itemcode}' already exists for platform ${data.pf_id}`);
        console.log(`❌ Storage: Existing item details:`, existingByCode[0]);
        throw new Error(`❌ DUPLICATE NOT ALLOWED: PF item code '${data.pf_itemcode}' already exists for this platform. Each item code must be unique within a platform.`);
      }
      
      // STRICT VALIDATION: Check for duplicate pf_itemname within the same platform
      const existingByName = await db
        .select()
        .from(pfItemMst)
        .where(and(
          eq(pfItemMst.pf_id, data.pf_id),
          eq(pfItemMst.pf_itemname, data.pf_itemname.trim())
        ));
      
      if (existingByName.length > 0) {
        console.log(`❌ Storage: BLOCKED - PF item name '${data.pf_itemname}' already exists for platform ${data.pf_id}`);
        console.log(`❌ Storage: Existing item details:`, existingByName[0]);
        throw new Error(`❌ DUPLICATE NOT ALLOWED: PF item name '${data.pf_itemname}' already exists for this platform. Each item name must be unique within a platform.`);
      }
      
      // EXTRA CHECK: Ensure exact combination doesn't exist
      const existingCombination = await db
        .select()
        .from(pfItemMst)
        .where(and(
          eq(pfItemMst.pf_id, data.pf_id),
          eq(pfItemMst.pf_itemcode, data.pf_itemcode.trim()),
          eq(pfItemMst.pf_itemname, data.pf_itemname.trim())
        ));
      
      if (existingCombination.length > 0) {
        console.log(`❌ Storage: BLOCKED - Exact combination already exists for platform ${data.pf_id}`);
        throw new Error(`❌ DUPLICATE NOT ALLOWED: This exact PF item already exists. Both the code and name must be unique.`);
      }
      
      console.log(`✅ Storage: No duplicates found, proceeding with PF item creation`);
      
      // Insert into pf_item_mst table
      const [newItem] = await db
        .insert(pfItemMst)
        .values({
          pf_id: data.pf_id,
          pf_itemcode: data.pf_itemcode,
          pf_itemname: data.pf_itemname,
          sap_id: data.sap_id
        })
        .returning();
      
      console.log(`✅ Storage: Successfully created PF item with ID: ${newItem.id}`);
      return newItem;
    } catch (error) {
      console.error("Error creating PF item:", error);
      
      // Handle database constraint violations
      if (error instanceof Error) {
        // Check for our new unique constraint violations from database
        if (error.message.includes('pf_item_unique_code_per_platform')) {
          throw new Error(`🚫 DATABASE BLOCKED: PF item code '${data.pf_itemcode}' already exists for this platform. No duplicate item codes allowed within the same platform.`);
        }
        if (error.message.includes('pf_item_unique_name_per_platform')) {
          throw new Error(`🚫 DATABASE BLOCKED: PF item name '${data.pf_itemname}' already exists for this platform. No duplicate item names allowed within the same platform.`);
        }
        // Check for old constraint names too (if they exist)
        if (error.message.includes('pf_item_mst_pf_id_itemcode_unique')) {
          throw new Error(`🚫 DATABASE BLOCKED: PF item code '${data.pf_itemcode}' already exists for this platform. No duplicates allowed.`);
        }
        if (error.message.includes('pf_item_mst_pf_id_itemname_unique')) {
          throw new Error(`🚫 DATABASE BLOCKED: PF item name '${data.pf_itemname}' already exists for this platform. No duplicates allowed.`);
        }
        // Re-throw with original message if it's already a user-friendly error
        if (error.message.includes('already exists') || error.message.includes('DUPLICATE NOT ALLOWED') || error.message.includes('DATABASE BLOCKED')) {
          throw error;
        }
      }
      
      throw new Error("Failed to create PF item");
    }
  }

  async checkPFItemDuplicates(data: { pf_id: number; pf_itemcode: string; pf_itemname: string }): Promise<{ codeExists: boolean; nameExists: boolean; }> {
    try {
      console.log(`🔍 Storage: Checking duplicates for Platform: ${data.pf_id}, Code: '${data.pf_itemcode}', Name: '${data.pf_itemname}'`);
      
      let codeExists = false;
      let nameExists = false;
      
      // Check for duplicate pf_itemcode
      if (data.pf_itemcode && data.pf_itemcode.trim()) {
        const existingByCode = await db
          .select()
          .from(pfItemMst)
          .where(and(
            eq(pfItemMst.pf_id, data.pf_id),
            eq(pfItemMst.pf_itemcode, data.pf_itemcode.trim())
          ));
        
        codeExists = existingByCode.length > 0;
        if (codeExists) {
          console.log(`⚠️ Storage: Item code '${data.pf_itemcode}' already exists for platform ${data.pf_id}`);
        }
      }
      
      // Check for duplicate pf_itemname
      if (data.pf_itemname && data.pf_itemname.trim()) {
        const existingByName = await db
          .select()
          .from(pfItemMst)
          .where(and(
            eq(pfItemMst.pf_id, data.pf_id),
            eq(pfItemMst.pf_itemname, data.pf_itemname.trim())
          ));
        
        nameExists = existingByName.length > 0;
        if (nameExists) {
          console.log(`⚠️ Storage: Item name '${data.pf_itemname}' already exists for platform ${data.pf_id}`);
        }
      }
      
      console.log(`✅ Storage: Duplicate check complete - Code exists: ${codeExists}, Name exists: ${nameExists}`);
      
      return { codeExists, nameExists };
    } catch (error) {
      console.error("Error checking PF item duplicates:", error);
      throw new Error("Failed to check for duplicates");
    }
  }

  async searchPFItems(searchTerm: string): Promise<any[]> {
    try {
      console.log('🔍 SearchPFItems - Starting search for:', searchTerm);
      
      // Query pf_item_mst and join with items table to get tax rate
      const result = await db
        .select({
          id: pfItemMst.id,
          pf_itemcode: pfItemMst.pf_itemcode,
          pf_itemname: pfItemMst.pf_itemname,
          pf_id: pfItemMst.pf_id,
          sap_id: pfItemMst.sap_id,
          actual_itemcode: items.itemcode, // Get actual item code from items table
          taxrate: items.taxrate // Get tax rate from items table (field name is 'taxrate' mapped to column 'u_tax_rate')
        })
        .from(pfItemMst)
        .leftJoin(items, eq(pfItemMst.sap_id, items.itemcode))
        .where(
          or(
            ilike(pfItemMst.pf_itemname, `%${searchTerm}%`),
            ilike(pfItemMst.pf_itemcode, `%${searchTerm}%`)
          )
        )
        .limit(50); // Limit results for performance
      
      console.log('🔍 SearchPFItems - Found', result.length, 'items');
      if (result.length > 0) {
        console.log('🔍 Sample item data:', JSON.stringify(result[0], null, 2));
      }
      
      return result;
    } catch (error) {
      console.error("Error searching PF items:", error);
      // Return empty array instead of throwing error to prevent UI crashes
      return [];
    }
  }

  async getUniqueDispatchLocations(): Promise<string[]> {
    try {
      console.log('🔍 Getting unique dispatch locations from po_master');
      
      // Get unique dispatch_from values from poMaster table where dispatch_from is not null/empty
      const result = await db
        .selectDistinct({ dispatch_from: poMaster.dispatch_from })
        .from(poMaster)
        .where(and(
          sql`${poMaster.dispatch_from} IS NOT NULL`,
          sql`trim(${poMaster.dispatch_from}) != ''`
        ))
        .orderBy(poMaster.dispatch_from);
      
      const locations = result
        .map(row => row.dispatch_from)
        .filter((location): location is string => location !== null && location.trim() !== '');
      
      console.log('🔍 Found unique dispatch locations:', locations);
      return locations;
    } catch (error) {
      console.error("Error getting unique dispatch locations:", error);
      return [];
    }
  }

  async syncItemsFromHana(hanaItems: any[]): Promise<number> {
    let syncedCount = 0;
    
    for (const hanaItem of hanaItems) {
      try {
        // Map HANA fields to our items table structure
        const itemData: InsertItems = {
          itemcode: hanaItem.ItemCode || '',
          itemname: hanaItem.ItemName || '',
          itemgroup: hanaItem.ItmsGrpNam || hanaItem.ItemGroup || null,
          type: hanaItem.U_TYPE || null,
          variety: hanaItem.U_Variety || null,
          subgroup: hanaItem.U_Sub_Group || hanaItem.SubGroup || null,
          brand: hanaItem.U_Brand || hanaItem.Brand || null,
          uom: hanaItem.InvntryUom || hanaItem.UOM || hanaItem.UnitOfMeasure || null,
          taxrate: hanaItem.U_Tax_Rate ? hanaItem.U_Tax_Rate.toString() : (hanaItem.TaxRate ? hanaItem.TaxRate.toString() : null),
          unitsize: hanaItem.U_IsLitre || hanaItem.UnitSize?.toString() || null,
          is_litre: hanaItem.U_IsLitre === 'Y' || hanaItem.IsLitre === true || false,
          case_pack: hanaItem.SalPackUn || hanaItem.CasePack || null,
          basic_rate: hanaItem.BasicRate ? hanaItem.BasicRate.toString() : null,
          landing_rate: hanaItem.LandingRate ? hanaItem.LandingRate.toString() : null,
          mrp: hanaItem.MRP ? hanaItem.MRP.toString() : null,
          last_synced: new Date()
        };

        // Check if item already exists
        const existingItem = await this.getItemByCode(itemData.itemcode);
        
        if (existingItem) {
          // Update existing item
          await this.updateItem(itemData.itemcode, itemData);
        } else {
          // Create new item
          await this.createItem(itemData);
        }
        
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing item ${hanaItem.ItemCode}:`, error);
      }
    }
    
    return syncedCount;
  }

  async seedStatusTables(): Promise<void> {
    try {
      // Seed PO statuses
      const poStatusData = [
        { status_name: 'OPEN', description: 'Purchase order is open and active', is_active: true },
        { status_name: 'CLOSED', description: 'Purchase order is closed/completed', is_active: true },
        { status_name: 'CANCELLED', description: 'Purchase order has been cancelled', is_active: true },
        { status_name: 'EXPIRED', description: 'Purchase order has expired', is_active: true },
        { status_name: 'DUPLICATE', description: 'Purchase order is marked as duplicate', is_active: true },
        { status_name: 'INVOICED', description: 'Purchase order has been invoiced', is_active: true }
      ];

      for (const status of poStatusData) {
        try {
          await db.insert(statuses).values(status);
        } catch (error: any) {
          if (error.code !== '23505') { // Ignore unique constraint violations
            throw error;
          }
        }
      }

      // Seed item statuses
      const itemStatusData = [
        { 
          status_name: 'PENDING', 
          description: 'Item is pending processing', 
          requires_invoice_fields: false, 
          requires_dispatch_date: false, 
          requires_delivery_date: false, 
          is_active: true 
        },
        { 
          status_name: 'DISPATCHED', 
          description: 'Item has been dispatched', 
          requires_invoice_fields: false, 
          requires_dispatch_date: true, 
          requires_delivery_date: false, 
          is_active: true 
        },
        { 
          status_name: 'DELIVERED', 
          description: 'Item has been delivered', 
          requires_invoice_fields: false, 
          requires_dispatch_date: true, 
          requires_delivery_date: true, 
          is_active: true 
        },
        { 
          status_name: 'INVOICED', 
          description: 'Item has been invoiced', 
          requires_invoice_fields: true, 
          requires_dispatch_date: false, 
          requires_delivery_date: false, 
          is_active: true 
        },
        { 
          status_name: 'CANCELLED', 
          description: 'Item has been cancelled', 
          requires_invoice_fields: false, 
          requires_dispatch_date: false, 
          requires_delivery_date: false, 
          is_active: true 
        },
        { 
          status_name: 'STOCK_ISSUE', 
          description: 'Item has stock issues', 
          requires_invoice_fields: false, 
          requires_dispatch_date: false, 
          requires_delivery_date: false, 
          is_active: true 
        },
        { 
          status_name: 'RECEIVED', 
          description: 'Item has been received', 
          requires_invoice_fields: false, 
          requires_dispatch_date: false, 
          requires_delivery_date: false, 
          is_active: true 
        },
        { 
          status_name: 'PARTIAL', 
          description: 'Item partially fulfilled', 
          requires_invoice_fields: false, 
          requires_dispatch_date: false, 
          requires_delivery_date: false, 
          is_active: true 
        }
      ];

      for (const status of itemStatusData) {
        try {
          await db.insert(statusItem).values(status);
        } catch (error: any) {
          if (error.code !== '23505') { // Ignore unique constraint violations
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error seeding status tables:', error);
      throw error;
    }
  }

  async createStatusTables(): Promise<void> {
    try {
      // Create statuses table with raw SQL
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS statuses (
          id SERIAL PRIMARY KEY,
          status_name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create status_item table with raw SQL
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS status_item (
          id SERIAL PRIMARY KEY,
          status_name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          requires_invoice_fields BOOLEAN DEFAULT FALSE,
          requires_dispatch_date BOOLEAN DEFAULT FALSE,
          requires_delivery_date BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Seed the data
      await this.seedStatusTables();
    } catch (error) {
      console.error('Error creating status tables:', error);
      throw error;
    }
  }

  async checkTableStructure(): Promise<any> {
    try {
      // Check if statuses table exists and its structure
      const statusesInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'statuses' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      // Check if status_item table exists and its structure  
      const statusItemInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'status_item' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      // Check if status_items table exists (plural form)
      const statusItemsInfo = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'status_items' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);

      return {
        statuses: {
          exists: statusesInfo.rows.length > 0,
          columns: statusesInfo.rows
        },
        status_item: {
          exists: statusItemInfo.rows.length > 0,
          columns: statusItemInfo.rows
        },
        status_items: {
          exists: statusItemsInfo.rows.length > 0,
          columns: statusItemsInfo.rows
        }
      };
    } catch (error) {
      console.error('Error checking table structure:', error);
      throw error;
    }
  }

  // Distributor PO methods
  async getAllDistributorPos(): Promise<(Omit<DistributorPo, 'distributor_id'> & { distributor: DistributorMst; orderItems: DistributorOrderItems[] })[]> {
    const pos = await db.select().from(distributorPo).orderBy(desc(distributorPo.created_at));
    
    const result = [];
    for (const po of pos) {
      // Get distributor details
      const [distributor] = await db.select().from(distributorMst).where(eq(distributorMst.id, po.distributor_id));
      
      // Get order items
      const orderItems = await db.select().from(distributorOrderItems).where(eq(distributorOrderItems.po_id, po.id));
      
      result.push({
        ...po,
        distributor: distributor!,
        orderItems
      });
    }
    
    return result;
  }

  async getDistributorPoById(id: number): Promise<(Omit<DistributorPo, 'distributor_id'> & { distributor: DistributorMst; orderItems: DistributorOrderItems[] }) | undefined> {
    const [po] = await db.select().from(distributorPo).where(eq(distributorPo.id, id));
    
    if (!po) {
      return undefined;
    }

    // Get distributor details
    const [distributor] = await db.select().from(distributorMst).where(eq(distributorMst.id, po.distributor_id));
    
    // Get order items
    const orderItems = await db.select().from(distributorOrderItems).where(eq(distributorOrderItems.po_id, po.id));
    
    return {
      ...po,
      distributor: distributor!,
      orderItems
    };
  }

  async createDistributorPo(po: InsertDistributorPo, items: InsertDistributorOrderItems[]): Promise<DistributorPo> {
    return await db.transaction(async (tx) => {
      // Create PO header
      const [createdPo] = await tx.insert(distributorPo).values(po).returning();
      
      // Create PO items
      if (items.length > 0) {
        const itemsWithPoId = items.map(item => ({
          ...item,
          po_id: createdPo.id
        }));
        await tx.insert(distributorOrderItems).values(itemsWithPoId);
      }
      
      return createdPo;
    });
  }

  async updateDistributorPo(id: number, po: Partial<InsertDistributorPo>, items?: InsertDistributorOrderItems[]): Promise<DistributorPo> {
    return await db.transaction(async (tx) => {
      // Update PO header
      const [updatedPo] = await tx
        .update(distributorPo)
        .set({ ...po, updated_at: new Date() })
        .where(eq(distributorPo.id, id))
        .returning();

      // If items are provided, update them
      if (items && items.length > 0) {
        // Delete existing items
        await tx.delete(distributorOrderItems).where(eq(distributorOrderItems.po_id, id));
        
        // Insert new items
        const itemsWithPoId = items.map(item => ({
          ...item,
          po_id: id
        }));
        await tx.insert(distributorOrderItems).values(itemsWithPoId);
      }

      return updatedPo;
    });
  }

  async deleteDistributorPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete order items first
      await tx.delete(distributorOrderItems).where(eq(distributorOrderItems.po_id, id));
      // Delete PO header
      await tx.delete(distributorPo).where(eq(distributorPo.id, id));
    });
  }

  // Distributor Order Items methods
  async getAllDistributorOrderItems(): Promise<(DistributorOrderItems & { po_number: string; distributor_name: string; order_date: Date; expiry_date: Date | null; distributor: DistributorMst })[]> {
    console.log('📋 Fetching distributor order items from po_master and po_lines (simplified version)...');
    
    try {
      // First, try to get just the po_lines data with minimal joins
      console.log('🔍 Testing po_lines table access...');
      const lines = await db
        .select({
          id: poLines.id,
          po_id: poLines.po_id,
          quantity: poLines.quantity,
          basic_amount: poLines.basic_amount,
          tax: poLines.tax,
          landing_amount: poLines.landing_amount,
          total_amount: poLines.total_amount,
          status: poLines.status,
          platform_product_code_id: poLines.platform_product_code_id
        })
        .from(poLines)
        .orderBy(desc(poLines.id))
        .limit(50); // Very small limit first
        
      console.log(`📊 Found ${lines.length} po_lines records`);
      
      if (lines.length === 0) {
        console.log('❌ No po_lines found, returning empty array');
        return [];
      }

      // Get corresponding PO data for just these lines
      const poIds = Array.from(new Set(lines.map(line => line.po_id)));
      console.log(`🔍 Getting PO data for ${poIds.length} unique PO IDs...`);
      
      const pos = await db
        .select()
        .from(poMaster)
        .where(inArray(poMaster.id, poIds));
        
      console.log(`📊 Found ${pos.length} po_master records`);
      
      // Get distributor data
      const distributorIds = Array.from(new Set(pos.map(po => po.distributor_id).filter(id => id != null)));
      console.log(`🔍 Getting distributor data for ${distributorIds.length} distributor IDs...`);
      
      const distributorsData = distributorIds.length > 0 ? await db
        .select()
        .from(distributorMst)
        .where(inArray(distributorMst.id, distributorIds)) : [];
      
      console.log(`📊 Found ${distributorsData.length} distributor records`);

      // Create maps for quick lookup
      const poMap = new Map();
      pos.forEach(po => poMap.set(po.id, po));
      
      const distributorMap = new Map();
      distributorsData.forEach(dist => distributorMap.set(dist.id, dist));

      // Transform data to match expected distributor order items format
      const transformedItems = lines
        .filter(line => line.po_id && poMap.has(line.po_id))
        .map(line => {
          const po = poMap.get(line.po_id);
          const distributor = po.distributor_id ? distributorMap.get(po.distributor_id) : null;
          const distributorName = distributor ? distributor.distributor_name : 'Unknown';
          
          // Map status properly - status is stored as integer in po_lines table
          // Default status should be 'Open' for new POs
          let statusText = 'Open';  // Changed default from 'Pending' to 'Open'
          if (line.status !== null && line.status !== undefined) {
            // Status is stored as integer in po_lines table
            const statusNum = typeof line.status === 'string' ? parseInt(line.status) : line.status;
            switch(statusNum) {
              case 0: statusText = 'Open'; break;
              case 1: statusText = 'Confirmed'; break;
              case 2: statusText = 'Shipped'; break;
              case 3: statusText = 'Delivered'; break;
              case 4: statusText = 'Cancelled'; break;
              default: statusText = 'Open';  // Default to 'Open' instead of 'Pending'
            }
          }
          
          return {
            id: line.id,
            po_id: line.po_id,
            item_name: `Product ID: ${line.platform_product_code_id}`,
            quantity: parseFloat(line.quantity || '0'),
            sap_code: null,
            category: null,
            subcategory: null,
            basic_rate: String(line.basic_amount || '0'),
            gst_rate: String(line.tax || '0'),
            landing_rate: String(line.landing_amount || line.total_amount || '0'),
            total_litres: null,
            status: statusText,
            hsn_code: null,
            po_number: po.vendor_po_number || 'UNKNOWN',
            distributor_name: distributorName,
            order_date: po.po_date ? new Date(po.po_date) : new Date(),
            expiry_date: po.expiry_date ? new Date(po.expiry_date) : null,
            distributor: {
              id: distributor?.id || 0,
              distributor_name: distributorName,
              distributor_code: null,
              contact_person: null,
              phone: null,
              email: null,
              address: po.region || 'Unknown',
              city: po.area || null,
              state: null,
              region: po.region || 'Unknown',
              status: 'Active',
              created_at: new Date(),
              updated_at: new Date()
            } as DistributorMst
          };
        });

      console.log(`✅ Transformed ${transformedItems.length} distributor order items from po_master/po_lines`);
      
      return transformedItems as (DistributorOrderItems & { po_number: string; distributor_name: string; order_date: Date; expiry_date: Date | null; distributor: DistributorMst })[];
      
    } catch (error) {
      console.error('❌ Error in getAllDistributorOrderItems:', error);
      // Return empty array instead of throwing to prevent API crashes
      return [];
    }
  }

  async updateDistributorOrderItemStatus(itemId: number, status: string): Promise<void> {
    console.log(`🔄 Updating distributor order item ${itemId} status to: ${status}`);
    
    // Convert status text to integer for po_lines table
    let statusNum = 0;
    switch(status.toUpperCase()) {
      case 'OPEN': statusNum = 0; break;
      case 'PENDING': statusNum = 0; break;  // Map PENDING to 0 (Open)
      case 'CONFIRMED': statusNum = 1; break;
      case 'SHIPPED': statusNum = 2; break;
      case 'DELIVERED': statusNum = 3; break;
      case 'CANCELLED': statusNum = 4; break;
      default: statusNum = 0;
    }
    
    // Update the po_lines table instead of distributor_order_items
    const result = await db
      .update(poLines)
      .set({ status: statusNum })
      .where(eq(poLines.id, itemId));
    console.log(`✅ Updated po_lines item ${itemId} status to ${statusNum} (${status}):`, result);
  }

  // BigBasket PO methods
  async getAllBigbasketPos(): Promise<(BigbasketPoHeader & { poLines: BigbasketPoLines[] })[]> {
    const pos = await db.select().from(bigbasketPoHeader).orderBy(desc(bigbasketPoHeader.created_at));
    
    const result = [];
    for (const po of pos) {
      const poLines = await db.select().from(bigbasketPoLines).where(eq(bigbasketPoLines.po_id, po.id));
      result.push({
        ...po,
        poLines
      });
    }
    
    return result;
  }

  async getBigbasketPoById(id: number): Promise<(BigbasketPoHeader & { poLines: BigbasketPoLines[] }) | undefined> {
    const [po] = await db.select().from(bigbasketPoHeader).where(eq(bigbasketPoHeader.id, id));
    if (!po) return undefined;
    
    const poLines = await db.select().from(bigbasketPoLines).where(eq(bigbasketPoLines.po_id, po.id));
    
    return {
      ...po,
      poLines
    };
  }

  async getBigbasketPoByNumber(poNumber: string): Promise<BigbasketPoHeader | undefined> {
    const [po] = await db.select().from(bigbasketPoHeader).where(eq(bigbasketPoHeader.po_number, poNumber));
    return po || undefined;
  }

  async createBigbasketPo(po: InsertBigbasketPoHeader, lines: InsertBigbasketPoLines[]): Promise<BigbasketPoHeader> {
    console.log('🔄 Starting BigBasket PO creation...');
    console.log('📋 Header data:', JSON.stringify(po, null, 2));
    console.log('📦 Lines data:', JSON.stringify(lines, null, 2));

    try {
      return await db.transaction(async (tx) => {
        console.log('💾 Inserting header...');

        // Insert header using Drizzle ORM
        const [createdPo] = await tx.insert(bigbasketPoHeader).values({
          po_number: po.po_number,
          po_date: po.po_date,
          po_expiry_date: po.po_expiry_date,
          warehouse_address: po.warehouse_address,
          delivery_address: po.delivery_address,
          supplier_name: po.supplier_name,
          supplier_address: po.supplier_address,
          supplier_gstin: po.supplier_gstin,
          dc_address: po.dc_address,
          dc_gstin: po.dc_gstin,
          total_items: po.total_items || 0,
          total_quantity: po.total_quantity || 0,
          total_basic_cost: po.total_basic_cost,
          total_gst_amount: po.total_gst_amount,
          total_cess_amount: po.total_cess_amount,
          grand_total: po.grand_total,
          status: po.status || 'pending',
          created_by: po.created_by,
          created_at: new Date(),
          updated_at: new Date()
        }).returning();

        console.log('✅ Header inserted successfully:', createdPo);

        // Insert lines if provided
        if (lines && lines.length > 0) {
          console.log(`💾 Inserting ${lines.length} line items...`);

          const linesWithPoId = lines.map(line => ({
            po_id: createdPo.id,
            s_no: line.s_no,
            hsn_code: line.hsn_code,
            sku_code: line.sku_code,
            description: line.description,
            ean_upc_code: line.ean_upc_code,
            case_quantity: line.case_quantity,
            quantity: line.quantity,
            basic_cost: line.basic_cost,
            sgst_percent: line.sgst_percent,
            sgst_amount: line.sgst_amount,
            cgst_percent: line.cgst_percent,
            cgst_amount: line.cgst_amount,
            igst_percent: line.igst_percent,
            igst_amount: line.igst_amount,
            gst_percent: line.gst_percent,
            gst_amount: line.gst_amount,
            cess_percent: line.cess_percent,
            cess_value: line.cess_value,
            state_cess_percent: line.state_cess_percent,
            state_cess: line.state_cess,
            landing_cost: line.landing_cost,
            mrp: line.mrp,
            total_value: line.total_value,
            created_at: new Date()
          }));

          await tx.insert(bigbasketPoLines).values(linesWithPoId);
          console.log('✅ Lines inserted successfully');
        }

        console.log('🎉 Transaction completed successfully!');
        return createdPo;
      });
    } catch (error) {
      console.error('❌ BigBasket PO creation failed:', error);
      throw error;
    }
  }

  async updateBigbasketPo(id: number, header: Partial<InsertBigbasketPoHeader>, lines?: InsertBigbasketPoLines[]): Promise<BigbasketPoHeader> {
    return await db.transaction(async (tx) => {
      // Update header
      const [updated] = await tx
        .update(bigbasketPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(bigbasketPoHeader.id, id))
        .returning();
      
      // If lines are provided, replace all existing lines
      if (lines && lines.length > 0) {
        // Delete existing lines
        await tx.delete(bigbasketPoLines).where(eq(bigbasketPoLines.po_id, id));
        
        // Insert new lines
        const linesWithPoId = lines.map(line => ({ ...line, po_id: id }));
        await tx.insert(bigbasketPoLines).values(linesWithPoId);
      }
      
      return updated;
    });
  }

  async deleteBigbasketPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all related po lines
      await tx.delete(bigbasketPoLines).where(eq(bigbasketPoLines.po_id, id));
      
      // Then delete the PO header
      await tx.delete(bigbasketPoHeader).where(eq(bigbasketPoHeader.id, id));
    });
  }

  // Zomato PO methods
  async getAllZomatoPos(): Promise<(ZomatoPoHeader & { poItems: ZomatoPoItems[] })[]> {
    const pos = await db.select().from(zomatoPoHeader).orderBy(desc(zomatoPoHeader.created_at));
    console.log(`🔍 getAllZomatoPos: Found ${pos.length} Zomato PO headers in database`);
    
    const result = [];
    for (const po of pos) {
      const poItems = await db.select().from(zomatoPoItems).where(eq(zomatoPoItems.po_header_id, po.id));
      result.push({
        ...po,
        poItems
      });
    }
    
    return result;
  }

  async getZomatoPoById(id: number): Promise<(ZomatoPoHeader & { poItems: ZomatoPoItems[] }) | undefined> {
    const [po] = await db.select().from(zomatoPoHeader).where(eq(zomatoPoHeader.id, id));
    
    if (!po) {
      return undefined;
    }

    const poItems = await db.select().from(zomatoPoItems).where(eq(zomatoPoItems.po_header_id, po.id));
    
    return {
      ...po,
      poItems
    };
  }

  async getZomatoPoByNumber(poNumber: string): Promise<ZomatoPoHeader | undefined> {
    const [po] = await db.select().from(zomatoPoHeader).where(eq(zomatoPoHeader.po_number, poNumber));
    return po || undefined;
  }

  async createZomatoPo(header: InsertZomatoPoHeader, items: InsertZomatoPoItems[]): Promise<ZomatoPoHeader> {
    return await db.transaction(async (tx) => {
      console.log('🔍 Zomato: About to insert into zomato_po_header table');
      console.log('🔍 Zomato: Header data:', JSON.stringify(header, null, 2));

      // Debug: Check all date fields in header
      Object.keys(header).forEach(key => {
        const value = (header as any)[key];
        if (key.includes('date') || key.includes('Date')) {
          console.log(`🔍 Zomato header date field ${key}:`, {
            value,
            type: typeof value,
            isDate: value instanceof Date,
            hasToISOString: value && typeof value.toISOString === 'function'
          });
        }
      });

      // Insert into platform-specific tables with error handling
      let createdPo: any;
      try {
        const result = await tx.insert(zomatoPoHeader).values(header).returning();
        createdPo = result[0];
        console.log('✅ Zomato: Successfully inserted into zomato_po_header');
      } catch (zomatoHeaderError) {
        console.error('❌ CRITICAL: Error inserting into zomato_po_header table:', zomatoHeaderError);
        console.error('❌ Header data that caused error:', JSON.stringify(header, null, 2));
        throw zomatoHeaderError;
      }

      if (items.length > 0) {
        const itemsWithPoId = items.map(item => ({
          ...item,
          po_header_id: createdPo.id
        }));

        try {
          await tx.insert(zomatoPoItems).values(itemsWithPoId);
          console.log('✅ Zomato: Successfully inserted into zomato_po_items');
        } catch (zomatoItemsError) {
          console.error('❌ CRITICAL: Error inserting into zomato_po_items table:', zomatoItemsError);
          throw zomatoItemsError;
        }

        // TEMPORARILY DISABLED: Also insert into consolidated po_master and po_lines tables
        // await this.insertIntoPoMasterAndLines(tx, 'Zomato', createdPo, itemsWithPoId);
        console.log('⚠️ Zomato: Skipping po_master insertion for debugging');
      } else {
        // TEMPORARILY DISABLED: Insert header only into po_master
        // await this.insertIntoPoMasterAndLines(tx, 'Zomato', createdPo, []);
        console.log('⚠️ Zomato: Skipping po_master insertion for debugging (no items)');
      }

      return createdPo;
    });
  }

  async updateZomatoPo(id: number, header: Partial<InsertZomatoPoHeader>, items?: InsertZomatoPoItems[]): Promise<ZomatoPoHeader> {
    return await db.transaction(async (tx) => {
      const [updatedPo] = await tx
        .update(zomatoPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(zomatoPoHeader.id, id))
        .returning();

      if (items && items.length > 0) {
        await tx.delete(zomatoPoItems).where(eq(zomatoPoItems.po_header_id, id));
        
        const itemsWithPoId = items.map(item => ({
          ...item,
          po_header_id: id
        }));
        await tx.insert(zomatoPoItems).values(itemsWithPoId);
      }

      return updatedPo;
    });
  }

  async deleteZomatoPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(zomatoPoItems).where(eq(zomatoPoItems.po_header_id, id));
      await tx.delete(zomatoPoHeader).where(eq(zomatoPoHeader.id, id));
    });
  }

  // Amazon PO methods
  async getAllAmazonPos(): Promise<(AmazonPoHeader & { poLines: AmazonPoLines[] })[]> {
    const pos = await db.select().from(amazonPoHeader).orderBy(desc(amazonPoHeader.created_at));
    console.log(`🔍 getAllAmazonPos: Found ${pos.length} Amazon PO headers in database`);

    const result = [];
    for (const po of pos) {
      const poLines = await db.select().from(amazonPoLines).where(eq(amazonPoLines.po_header_id, po.id));
      result.push({
        ...po,
        poLines
      });
    }

    return result;
  }

  async getAmazonPoById(id: number): Promise<(AmazonPoHeader & { poLines: AmazonPoLines[] }) | undefined> {
    const [po] = await db.select().from(amazonPoHeader).where(eq(amazonPoHeader.id, id));

    if (!po) {
      return undefined;
    }

    const poLines = await db.select().from(amazonPoLines).where(eq(amazonPoLines.po_header_id, po.id));

    return {
      ...po,
      poLines
    };
  }

  async getAmazonPoByNumber(poNumber: string): Promise<AmazonPoHeader | undefined> {
    const [po] = await db.select().from(amazonPoHeader).where(eq(amazonPoHeader.po_number, poNumber));
    return po || undefined;
  }

  async createAmazonPo(header: InsertAmazonPoHeader, items: InsertAmazonPoLines[]): Promise<AmazonPoHeader> {
    return await db.transaction(async (tx) => {
      console.log('🔍 Amazon: About to insert into amazon_po_header table');
      console.log('🔍 Amazon: Header data:', JSON.stringify(header, null, 2));

      const [insertedHeader] = await tx.insert(amazonPoHeader).values(header).returning();
      console.log('✅ Amazon: Successfully inserted header:', insertedHeader);

      if (items && items.length > 0) {
        const itemsWithHeaderId = items.map(item => ({
          ...item,
          po_header_id: insertedHeader.id
        }));

        console.log(`🔍 Amazon: About to insert ${itemsWithHeaderId.length} line items`);
        await tx.insert(amazonPoLines).values(itemsWithHeaderId);
        console.log('✅ Amazon: Successfully inserted line items');
      }

      return insertedHeader;
    });
  }

  async updateAmazonPo(id: number, header: Partial<InsertAmazonPoHeader>, items?: InsertAmazonPoLines[]): Promise<AmazonPoHeader> {
    return await db.transaction(async (tx) => {
      const [updatedHeader] = await tx
        .update(amazonPoHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(amazonPoHeader.id, id))
        .returning();

      if (items) {
        await tx.delete(amazonPoLines).where(eq(amazonPoLines.po_header_id, id));

        if (items.length > 0) {
          const itemsWithHeaderId = items.map(item => ({
            ...item,
            po_header_id: id
          }));
          await tx.insert(amazonPoLines).values(itemsWithHeaderId);
        }
      }

      return updatedHeader;
    });
  }

  async deleteAmazonPo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(amazonPoLines).where(eq(amazonPoLines.po_header_id, id));
      await tx.delete(amazonPoHeader).where(eq(amazonPoHeader.id, id));
    });
  }

  // Dealshare PO methods
  async getAllDealsharePos(): Promise<(DealsharePoHeader & { poItems: DealsharePoItems[] })[]> {
    const pos = await db.select().from(dealsharePoHeader).orderBy(desc(dealsharePoHeader.created_at));
    
    const result = [];
    for (const po of pos) {
      const poItems = await db.select().from(dealsharePoLines).where(eq(dealsharePoLines.po_header_id, po.id));
      result.push({
        ...po,
        poItems
      });
    }
    
    return result;
  }

  async getDealsharePoById(id: number): Promise<(DealsharePoHeader & { poItems: DealsharePoItems[] }) | undefined> {
    const [po] = await db.select().from(dealsharePoHeader).where(eq(dealsharePoHeader.id, id));
    
    if (!po) {
      return undefined;
    }

    const poItems = await db.select().from(dealsharePoLines).where(eq(dealsharePoLines.po_header_id, po.id));
    
    return {
      ...po,
      poItems
    };
  }

  async getDealsharePoByNumber(poNumber: string): Promise<DealsharePoHeader | undefined> {
    const [po] = await db.select().from(dealsharePoHeader).where(eq(dealsharePoHeader.po_number, poNumber));
    return po || undefined;
  }

  async createDealsharePo(header: InsertDealsharePoHeader, items: InsertDealsharePoItems[]): Promise<DealsharePoHeader> {
    return await db.transaction(async (tx) => {
      // Schema now accepts string values directly - no conversion needed
      console.log('🔍 STORAGE: Using header data directly (string timestamps supported)');

      // Insert into platform-specific tables
      const [createdPo] = await tx.insert(dealsharePoHeader).values(header).returning();
      
      if (items.length > 0) {
        const itemsWithPoId = items.map(item => {
          const safeItem = { ...item, po_header_id: createdPo.id };

          // Convert any timestamp fields in items that might be strings
          const itemDateFields = ['created_at', 'updated_at'];
          itemDateFields.forEach(field => {
            if (safeItem[field] && typeof safeItem[field] === 'string') {
              console.log(`🔧 STORAGE FIX: Converting item ${field} from string "${safeItem[field]}" to Date object`);
              safeItem[field] = new Date(safeItem[field]);
            }
          });

          return safeItem;
        });
        await tx.insert(dealsharePoLines).values(itemsWithPoId);

        // Commented out: Skip inserting into consolidated po_master and po_lines tables
        // await this.insertIntoPoMasterAndLines(tx, 'Dealshare', createdPo, itemsWithPoId);
      } else {
        // Commented out: Skip inserting header only into po_master
        // await this.insertIntoPoMasterAndLines(tx, 'Dealshare', createdPo, []);
      }
      
      return createdPo;
    });
  }

  async updateDealsharePo(id: number, header: Partial<InsertDealsharePoHeader>, items?: InsertDealsharePoItems[]): Promise<DealsharePoHeader> {
    return await db.transaction(async (tx) => {
      const [updatedPo] = await tx
        .update(dealsharePoHeader)
        .set({ ...header, updated_at: new Date().toISOString() as any })
        .where(eq(dealsharePoHeader.id, id))
        .returning();

      if (items && items.length > 0) {
        await tx.delete(dealsharePoLines).where(eq(dealsharePoLines.po_header_id, id));
        
        const itemsWithPoId = items.map(item => ({
          ...item,
          po_header_id: id
        }));
        await tx.insert(dealsharePoLines).values(itemsWithPoId);
      }

      return updatedPo;
    });
  }

  async deleteDealsharePo(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(dealsharePoLines).where(eq(dealsharePoLines.po_header_id, id));
      await tx.delete(dealsharePoHeader).where(eq(dealsharePoHeader.id, id));
    });
  }

  // Secondary Sales methods
  async getAllSecondarySales(platform?: string, businessUnit?: string): Promise<(SecondarySalesHeader & { salesItems: SecondarySalesItems[] })[]> {
    const conditions = [];
    if (platform) conditions.push(eq(secondarySalesHeader.platform, platform));
    if (businessUnit) conditions.push(eq(secondarySalesHeader.business_unit, businessUnit));
    
    const sales = conditions.length > 0 
      ? await db.select().from(secondarySalesHeader).where(and(...conditions)).orderBy(desc(secondarySalesHeader.created_at))
      : await db.select().from(secondarySalesHeader).orderBy(desc(secondarySalesHeader.created_at));
    
    const result = [];
    for (const sale of sales) {
      const salesItems = await db.select().from(secondarySalesItems).where(eq(secondarySalesItems.header_id, sale.id));
      result.push({
        ...sale,
        salesItems
      });
    }
    
    return result;
  }

  async getSecondarySalesById(id: number): Promise<(SecondarySalesHeader & { salesItems: SecondarySalesItems[] }) | undefined> {
    const [sale] = await db.select().from(secondarySalesHeader).where(eq(secondarySalesHeader.id, id));
    
    if (!sale) {
      return undefined;
    }

    const salesItems = await db.select().from(secondarySalesItems).where(eq(secondarySalesItems.header_id, sale.id));
    
    return {
      ...sale,
      salesItems
    };
  }

  async createSecondarySales(header: InsertSecondarySalesHeader, items: InsertSecondarySalesItems[]): Promise<SecondarySalesHeader> {
    return await db.transaction(async (tx) => {
      const [createdSale] = await tx.insert(secondarySalesHeader).values(header).returning();
      
      if (items.length > 0) {
        const itemsWithHeaderId = items.map(item => ({
          ...item,
          header_id: createdSale.id
        }));
        await tx.insert(secondarySalesItems).values(itemsWithHeaderId);
      }
      
      return createdSale;
    });
  }

  async updateSecondarySales(id: number, header: Partial<InsertSecondarySalesHeader>, items?: InsertSecondarySalesItems[]): Promise<SecondarySalesHeader> {
    return await db.transaction(async (tx) => {
      const [updatedSale] = await tx
        .update(secondarySalesHeader)
        .set({ ...header, updated_at: new Date() })
        .where(eq(secondarySalesHeader.id, id))
        .returning();

      if (items && items.length > 0) {
        await tx.delete(secondarySalesItems).where(eq(secondarySalesItems.header_id, id));
        
        const itemsWithHeaderId = items.map(item => ({
          ...item,
          header_id: id
        }));
        await tx.insert(secondarySalesItems).values(itemsWithHeaderId);
      }

      return updatedSale;
    });
  }

  async deleteSecondarySales(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(secondarySalesItems).where(eq(secondarySalesItems.header_id, id));
      await tx.delete(secondarySalesHeader).where(eq(secondarySalesHeader.id, id));
    });
  }

  // Specific Secondary Sales table methods
  async createScAmJwDaily(items: InsertScAmJwDaily[]): Promise<ScAmJwDaily[]> {
    return await db.insert(scAmJwDaily).values(items).returning();
  }

  async createScAmJwRange(items: InsertScAmJwRange[]): Promise<ScAmJwRange[]> {
    return await db.insert(scAmJwRange).values(items).returning();
  }

  async createScAmJmDaily(items: InsertScAmJmDaily[]): Promise<ScAmJmDaily[]> {
    return await db.insert(scAmJmDaily).values(items).returning();
  }

  async createScAmJmRange(items: InsertScAmJmRange[]): Promise<ScAmJmRange[]> {
    return await db.insert(scAmJmRange).values(items).returning();
  }

  async getScAmJwDaily(dateStart?: string, dateEnd?: string): Promise<ScAmJwDaily[]> {
    if (dateStart && dateEnd) {
      return await db.select().from(scAmJwDaily)
        .where(
          and(
            gte(scAmJwDaily.report_date, new Date(dateStart)),
            lte(scAmJwDaily.report_date, new Date(dateEnd))
          )
        )
        .orderBy(desc(scAmJwDaily.report_date));
    } else if (dateStart) {
      return await db.select().from(scAmJwDaily)
        .where(eq(scAmJwDaily.report_date, new Date(dateStart)))
        .orderBy(desc(scAmJwDaily.report_date));
    }
    
    return await db.select().from(scAmJwDaily).orderBy(desc(scAmJwDaily.report_date));
  }

  async getScAmJwRange(dateStart?: string, dateEnd?: string): Promise<ScAmJwRange[]> {
    if (dateStart && dateEnd) {
      return await db.select().from(scAmJwRange)
        .where(
          and(
            gte(scAmJwRange.period_start, new Date(dateStart)),
            lte(scAmJwRange.period_end, new Date(dateEnd))
          )
        )
        .orderBy(desc(scAmJwRange.period_start));
    }
    
    return await db.select().from(scAmJwRange).orderBy(desc(scAmJwRange.period_start));
  }

  async getScAmJmDaily(dateStart?: string, dateEnd?: string): Promise<ScAmJmDaily[]> {
    if (dateStart && dateEnd) {
      return await db.select().from(scAmJmDaily)
        .where(
          and(
            gte(scAmJmDaily.report_date, new Date(dateStart)),
            lte(scAmJmDaily.report_date, new Date(dateEnd))
          )
        )
        .orderBy(desc(scAmJmDaily.report_date));
    } else if (dateStart) {
      return await db.select().from(scAmJmDaily)
        .where(eq(scAmJmDaily.report_date, new Date(dateStart)))
        .orderBy(desc(scAmJmDaily.report_date));
    }
    
    return await db.select().from(scAmJmDaily).orderBy(desc(scAmJmDaily.report_date));
  }

  async getScAmJmRange(dateStart?: string, dateEnd?: string): Promise<ScAmJmRange[]> {
    if (dateStart && dateEnd) {
      return await db.select().from(scAmJmRange)
        .where(
          and(
            gte(scAmJmRange.period_start, new Date(dateStart)),
            lte(scAmJmRange.period_end, new Date(dateEnd))
          )
        )
        .orderBy(desc(scAmJmRange.period_start));
    }
    
    return await db.select().from(scAmJmRange).orderBy(desc(scAmJmRange.period_start));
  }

  // New secondary sales platform methods
  async createScZeptoJmDaily(items: InsertZeptoSecondarySalesItem[]): Promise<ZeptoSecondarySalesItem[]> {
    return await db.insert(scZeptoJmDaily).values(items).returning();
  }

  async createScZeptoJmRange(items: InsertZeptoSecondarySalesRangeItem[]): Promise<ZeptoSecondarySalesRangeItem[]> {
    return await db.insert(scZeptoJmRange).values(items).returning();
  }

  async createScBlinkitJmDaily(items: InsertBlinkitSecondarySalesItem[]): Promise<BlinkitSecondarySalesItem[]> {
    return await db.insert(scBlinkitJmDaily).values(items).returning();
  }

  async createScBlinkitJmRange(items: InsertBlinkitSecondarySalesRangeItem[]): Promise<BlinkitSecondarySalesRangeItem[]> {
    return await db.insert(scBlinkitJmRange).values(items).returning();
  }

  async createScSwiggyJmDaily(items: InsertSwiggySecondarySalesItem[]): Promise<SwiggySecondarySalesItem[]> {
    return await db.insert(scSwiggyJmDaily).values(items).returning();
  }

  async createScSwiggyJmRange(items: InsertSwiggySecondarySalesRangeItem[]): Promise<SwiggySecondarySalesRangeItem[]> {
    return await db.insert(scSwiggyJmRange).values(items).returning();
  }

  async createScJioMartSaleJmDaily(items: InsertJioMartSaleSecondarySalesItem[]): Promise<JioMartSaleSecondarySalesItem[]> {
    return await db.insert(scJioMartSaleJmDaily).values(items).returning();
  }

  async createScJioMartSaleJmRange(items: InsertJioMartSaleSecondarySalesRangeItem[]): Promise<JioMartSaleSecondarySalesRangeItem[]> {
    return await db.insert(scJioMartSaleJmRange).values(items).returning();
  }

  async createScJioMartCancelJmDaily(items: InsertJioMartCancelSecondarySalesItem[]): Promise<JioMartCancelSecondarySalesItem[]> {
    return await db.insert(scJioMartCancelJmDaily).values(items).returning();
  }

  async createScJioMartCancelJmRange(items: InsertJioMartCancelSecondarySalesRangeItem[]): Promise<JioMartCancelSecondarySalesRangeItem[]> {
    return await db.insert(scJioMartCancelJmRange).values(items).returning();
  }

  async createScBigBasketJmDaily(items: InsertBigBasketSecondarySalesItem[]): Promise<BigBasketSecondarySalesItem[]> {
    return await db.insert(scBigBasketJmDaily).values(items).returning();
  }

  async createScBigBasketJmRange(items: InsertBigBasketSecondarySalesRangeItem[]): Promise<BigBasketSecondarySalesRangeItem[]> {
    return await db.insert(scBigBasketJmRange).values(items).returning();
  }

  // Inventory Management methods
  async getAllInventory(platform?: string, businessUnit?: string): Promise<any[]> {
    // For now, return an empty array since we only support Jio Mart
    // This can be expanded when more platforms are added
    return [];
  }

  async getInventoryById(id: number): Promise<any> {
    // Check both daily and range tables for Jio Mart inventory
    const dailyResult = await db.select().from(invJioMartJmDaily).where(eq(invJioMartJmDaily.id, id));
    if (dailyResult.length > 0) {
      return { ...dailyResult[0], type: 'daily' };
    }

    const rangeResult = await db.select().from(invJioMartJmRange).where(eq(invJioMartJmRange.id, id));
    if (rangeResult.length > 0) {
      return { ...rangeResult[0], type: 'range' };
    }

    return undefined;
  }

  async createInventoryJioMartJmDaily(items: InsertJioMartInventoryItem[]): Promise<JioMartInventoryItem[]> {
    return await db.insert(invJioMartJmDaily).values(items).returning();
  }

  async createInventoryJioMartJmRange(items: InsertJioMartInventoryRangeItem[]): Promise<JioMartInventoryRangeItem[]> {
    return await db.insert(invJioMartJmRange).values(items).returning();
  }

  async createInventoryBlinkitJmDaily(items: InsertBlinkitInventoryItem[]): Promise<BlinkitInventoryItem[]> {
    return await db.insert(invBlinkitJmDaily).values(items).returning();
  }

  async createInventoryBlinkitJmRange(items: any[]): Promise<any[]> {
    return await db.insert(invBlinkitJmRange).values(items).returning();
  }

  // Amazon Inventory methods
  async createInventoryAmazonJmDaily(items: any[]): Promise<any[]> {
    return await db.insert(invAmazonJmDaily).values(items).returning();
  }

  async createInventoryAmazonJmRange(items: any[]): Promise<any[]> {
    return await db.insert(invAmazonJmRange).values(items).returning();
  }

  async createInventoryAmazonJwDaily(items: any[]): Promise<any[]> {
    return await db.insert(invAmazonJwDaily).values(items).returning();
  }

  async createInventoryAmazonJwRange(items: any[]): Promise<any[]> {
    return await db.insert(invAmazonJwRange).values(items).returning();
  }

  // Swiggy Inventory JM Daily
  async createInventorySwiggyJmDaily(items: any[]): Promise<SwiggyInventoryItem[]> {
    return await db.insert(invSwiggyJmDaily).values(items).returning();
  }

  // Swiggy Inventory JM Range
  async createInventorySwiggyJmRange(items: any[]): Promise<SwiggyInventoryRange[]> {
    return await db.insert(invSwiggyJmRange).values(items).returning();
  }

  // FlipKart Inventory JM Daily
  async createInventoryFlipkartJmDaily(items: InsertFlipkartInventoryDaily[]): Promise<FlipkartInventoryDaily[]> {
    return await db.insert(invFlipkartJmDaily).values(items).returning();
  }

  // FlipKart Inventory JM Range  
  async createInventoryFlipkartJmRange(items: InsertFlipkartInventoryRange[]): Promise<FlipkartInventoryRange[]> {
    return await db.insert(invFlipkartJmRange).values(items).returning();
  }

  // Zepto Inventory JM Daily
  async createInventoryZeptoJmDaily(items: InsertZeptoInventoryDaily[]): Promise<ZeptoInventoryDaily[]> {
    return await db.insert(invZeptoJmDaily).values(items).returning();
  }

  // Zepto Inventory JM Range  
  async createInventoryZeptoJmRange(items: InsertZeptoInventoryRange[]): Promise<ZeptoInventoryRange[]> {
    return await db.insert(invZeptoJmRange).values(items).returning();
  }

  // BigBasket Inventory JM Daily
  async createInventoryBigBasketJmDaily(items: InsertBigBasketInventoryDaily[]): Promise<BigBasketInventoryDaily[]> {
    return await db.insert(invBigBasketJmDaily).values(items).returning();
  }

  // BigBasket Inventory JM Range  
  async createInventoryBigBasketJmRange(items: InsertBigBasketInventoryRange[]): Promise<BigBasketInventoryRange[]> {
    return await db.insert(invBigBasketJmRange).values(items).returning();
  }

  async updateInventory(id: number, header: any, items: any): Promise<any> {
    // This would need to be implemented based on specific requirements
    // For now, return a placeholder
    throw new Error("Inventory update not yet implemented");
  }

  async deleteInventory(id: number): Promise<void> {
    // Try to delete from both tables
    await db.delete(invJioMartJmDaily).where(eq(invJioMartJmDaily.id, id));
    await db.delete(invJioMartJmRange).where(eq(invJioMartJmRange.id, id));
  }

  // Logging methods implementation
  async createLog(logData: InsertLogMaster): Promise<LogMaster> {
    const [newLog] = await db.insert(logMaster).values(logData).returning();
    return newLog;
  }

  async logEdit(params: {
    username: string;
    action: string;
    tableName: string;
    recordId: number;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    console.log(`📝 Logging ${params.action} on ${params.tableName} record ${params.recordId} by ${params.username}`);
    
    const logData: InsertLogMaster = {
      username: params.username,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      field_name: params.fieldName || null,
      old_value: params.oldValue || null,
      new_value: params.newValue || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      session_id: params.sessionId || null,
      timestamp: new Date()
    };

    try {
      await this.createLog(logData);
      console.log(`✅ Log entry created successfully for ${params.action} on ${params.tableName}`);
    } catch (error) {
      console.error(`❌ Failed to create log entry:`, error);
      // Don't throw error - logging failure shouldn't break the main operation
    }
  }

  // Helper method to map item status string to status ID
  private mapItemStatusToId(status?: string): number {
    if (!status) return 1; // Default to PENDING
    
    const statusMap: Record<string, number> = {
      'PENDING': 1,
      'INVOICED': 2,
      'DISPATCHED': 3,
      'DELIVERED': 4,
      'STOCK_ISSUE': 5,
      'PRICE_DIFF': 6,
      'MOV_ISSUE': 7,
      'CANCELLED': 8,
      'EXPIRED': 9
    };
    
    return statusMap[status.toUpperCase()] || 1;
  }

  // Method to update PO in existing po_master and po_lines tables
  async updatePoInExistingTables(poId: number, masterData: any, linesData: any[]): Promise<any> {
    return await db.transaction(async (tx) => {
      // First check if PO exists in po_master
      console.log(`🔍 Checking if PO ${poId} exists in po_master...`);
      const existingPo = await tx.select().from(poMaster).where(eq(poMaster.id, poId)).limit(1);

      // If PO doesn't exist in po_master, INSERT it (first-time edit of platform-specific PO)
      if (!existingPo || existingPo.length === 0) {
        console.log(`📝 PO ${poId} not found in po_master, performing INSERT...`);

        // Find distributor ID by name if serving_distributor is provided
        let distributorId = 1; // Default distributor ID
        if (masterData.serving_distributor) {
          try {
            const distributor = await tx
              .select({ id: distributorMst.id })
              .from(distributorMst)
              .where(eq(distributorMst.distributor_name, masterData.serving_distributor))
              .limit(1);

            if (distributor.length > 0) {
              distributorId = distributor[0].id;
              console.log(`🔍 Found distributor ID ${distributorId} for name "${masterData.serving_distributor}"`);
            }
          } catch (error) {
            console.error("Error looking up distributor:", error);
          }
        }

        // Insert new record with the platform-specific ID
        const insertValues: any = {
          id: poId, // Use the platform-specific ID
          platform_id: masterData.platform_id || 1, // Default to platform 1 if missing
          vendor_po_number: masterData.po_number || `PO-${poId}`,
          distributor_id: distributorId || 1, // Ensure we have a distributor
          series: "PO",
          company_id: 6,
          po_date: masterData.po_date ? new Date(masterData.po_date) : new Date(),
          status_id: masterData.status_id || 1,
          region: masterData.region || null,
          area: masterData.area || null,
          state_id: masterData.state_id || null,
          district_id: masterData.district_id || null,
          dispatch_from: masterData.dispatch_from || null,
          ware_house: masterData.warehouse || null,
          appointment_date: masterData.appointment_date ? new Date(masterData.appointment_date) : null,
          expiry_date: masterData.expiry_date ? new Date(masterData.expiry_date) : null,
          created_by: null,
          create_on: new Date(), // Add create_on which is required
          updated_on: new Date()
        };

        console.log(`📝 Prepared insertValues:`, JSON.stringify(insertValues, null, 2));

        console.log(`📝 Inserting into po_master with ID ${poId}:`, insertValues);

        let createdMaster;
        try {
          [createdMaster] = await tx.insert(poMaster).values(insertValues).returning();
          console.log(`✅ Successfully inserted po_master record with ID ${poId}`);
        } catch (insertError: any) {
          console.error(`❌ Error inserting into po_master:`, insertError);
          console.error(`❌ Error code:`, insertError?.code);
          console.error(`❌ Error detail:`, insertError?.detail);

          // If duplicate key error, this means it already exists - treat as update instead
          if (insertError?.code === '23505' || insertError?.message?.includes('duplicate key')) {
            console.log(`⚠️ PO ${poId} already exists in po_master (likely from race condition), switching to UPDATE`);
            throw new Error(`PO ${poId} already exists in po_master. Please try refreshing and editing again.`);
          }

          throw insertError;
        }

        // Insert lines
        if (linesData.length > 0) {
          const mappedLines = [];

          for (const line of linesData) {
            let platformProductCodeId = 1;

            if (line.platform_code || line.sap_code) {
              const searchCode = line.platform_code || line.sap_code;
              const platformItem = await tx
                .select({ id: pfItemMst.id })
                .from(pfItemMst)
                .where(eq(pfItemMst.pf_itemcode, searchCode))
                .limit(1);

              if (platformItem.length > 0) {
                platformProductCodeId = platformItem[0].id;
              }
            }

            mappedLines.push({
              po_id: createdMaster.id,
              platform_product_code_id: platformProductCodeId,
              quantity: line.quantity.toString(),
              basic_amount: line.basic_amount.toString(),
              tax: line.tax_percent ? (parseFloat(line.basic_amount.toString()) * parseFloat(line.tax_percent.toString()) / 100).toString() : "0",
              landing_amount: line.landing_amount ? line.landing_amount.toString() : null,
              total_amount: line.total_amount.toString(),
              uom: line.uom || null,
              total_liter: line.total_ltrs ? line.total_ltrs.toString() : null,
              boxes: line.boxes ? Math.floor(parseFloat(line.boxes.toString())) : null,
              invoice_date: line.invoice_date || null,
              invoice_litre: line.invoice_litre ? line.invoice_litre.toString() : null,
              invoice_amount: line.invoice_amount ? line.invoice_amount.toString() : null,
              invoice_qty: line.invoice_qty ? line.invoice_qty.toString() : null,
              remark: `${line.item_name} - Platform Code: ${line.platform_code} - SAP Code: ${line.sap_code} - Tax Rate: ${line.tax_percent || 0}%`,
              status: this.mapItemStatusToId(line.status),
              delete: false,
              deleted: false
            });
          }

          await tx.insert(poLines).values(mappedLines);
          console.log(`✅ Inserted ${mappedLines.length} lines into po_lines for new PO ${poId}`);
        }

        console.log(`✅ Successfully INSERTED PO ${poId} into po_master and po_lines`);
        return createdMaster;
      }

      // PO exists, proceed with UPDATE
      console.log(`📝 PO ${poId} found in po_master, performing UPDATE...`);

      // Build update object with only provided fields
      const updateData: any = {
        updated_on: new Date()
      };
      
      if (masterData.platform_id !== undefined) updateData.platform_id = masterData.platform_id;
      if (masterData.po_number) updateData.vendor_po_number = masterData.po_number;
      
      // Handle distributor mapping - convert name to ID if serving_distributor is provided
      if (masterData.serving_distributor !== undefined) {
        if (masterData.serving_distributor) {
          try {
            const distributor = await tx
              .select({ id: distributorMst.id })
              .from(distributorMst)
              .where(eq(distributorMst.distributor_name, masterData.serving_distributor))
              .limit(1);
            
            if (distributor.length > 0) {
              updateData.distributor_id = distributor[0].id;
              console.log(`🔍 UPDATE: Found distributor ID ${distributor[0].id} for name "${masterData.serving_distributor}"`);
            } else {
              console.log(`⚠️ UPDATE WARNING: Distributor "${masterData.serving_distributor}" not found, keeping existing distributor`);
            }
          } catch (error) {
            console.error("Error looking up distributor during update:", error);
          }
        } else {
          // If serving_distributor is explicitly null/empty, set to default
          updateData.distributor_id = 1;
        }
      } else if (masterData.distributor_id !== undefined) {
        updateData.distributor_id = masterData.distributor_id;
      }
      if (masterData.po_date) updateData.po_date = new Date(masterData.po_date);
      // Handle status mapping - accept both status string and status_id
      if (masterData.status_id !== undefined) {
        updateData.status_id = masterData.status_id;
      } else if (masterData.status) {
        // Map status strings to status_id
        updateData.status_id = masterData.status === "INVOICED" ? 2 : 1;
      }
      if (masterData.region) updateData.region = masterData.region;
      if (masterData.area) updateData.area = masterData.area;
      if (masterData.state_id !== undefined) updateData.state_id = masterData.state_id;
      if (masterData.district_id !== undefined) updateData.district_id = masterData.district_id;
      if (masterData.dispatch_from !== undefined) updateData.dispatch_from = masterData.dispatch_from;
      if (masterData.warehouse !== undefined) updateData.ware_house = masterData.warehouse;
      if (masterData.appointment_date !== undefined) {
        updateData.appointment_date = masterData.appointment_date ? new Date(masterData.appointment_date) : null;
      }
      if (masterData.expiry_date !== undefined) {
        updateData.expiry_date = masterData.expiry_date ? new Date(masterData.expiry_date) : null;
      }
      
      // Update po_master table
      const [updatedMaster] = await tx
        .update(poMaster)
        .set(updateData)
        .where(eq(poMaster.id, poId))
        .returning();
      
      // Delete existing po_lines for this PO
      await tx.delete(poLines).where(eq(poLines.po_id, poId));
      
      // Insert updated lines
      if (linesData.length > 0) {
        const mappedLines = [];
        
        for (const line of linesData) {
          let platformProductCodeId = 1; // Default fallback
          
          // Try to find the platform item by platform_code or sap_code
          if (line.platform_code || line.sap_code) {
            const platformItem = await tx
              .select({ id: pfItemMst.id })
              .from(pfItemMst)
              .where(
                line.platform_code 
                  ? eq(pfItemMst.pf_itemcode, line.platform_code)
                  : eq(pfItemMst.pf_itemcode, line.sap_code)
              )
              .limit(1);
            
            if (platformItem.length > 0) {
              platformProductCodeId = platformItem[0].id;
            }
          }
          
          mappedLines.push({
            po_id: updatedMaster.id,
            platform_product_code_id: platformProductCodeId,
            quantity: line.quantity.toString(),
            basic_amount: line.basic_amount.toString(),
            tax: line.tax_percent ? (parseFloat(line.basic_amount.toString()) * parseFloat(line.tax_percent.toString()) / 100).toString() : "0",
            landing_amount: line.landing_amount ? line.landing_amount.toString() : null,
            total_amount: line.total_amount.toString(),
            uom: line.uom || null,
            total_liter: line.total_ltrs ? line.total_ltrs.toString() : null,
            boxes: line.boxes ? Math.floor(parseFloat(line.boxes.toString())) : null,
            // Invoice fields
            invoice_date: line.invoice_date || null,
            invoice_litre: line.invoice_litre ? line.invoice_litre.toString() : null,
            invoice_amount: line.invoice_amount ? line.invoice_amount.toString() : null,
            invoice_qty: line.invoice_qty ? line.invoice_qty.toString() : null,
            remark: `${line.item_name} - Platform Code: ${line.platform_code} - SAP Code: ${line.sap_code} - Tax Rate: ${line.tax_percent || 0}%`,
            status: this.mapItemStatusToId(line.status),
            delete: false,
            deleted: false
          });
        }
        
        console.log("🔍 DEBUG mappedLines before insert:", JSON.stringify(mappedLines, null, 2));
        
        // Log tax rate preservation for each line
        mappedLines.forEach((line, index) => {
          console.log(`✅ Tax rate preserved for line ${index + 1}: included in remark, calculated tax = ${line.tax}`);
        });
        
        await tx.insert(poLines).values(mappedLines);
        
        // Check if all items are delivered and auto-close PO if needed
        const allItemsDelivered = linesData.every(line => {
          const status = line.status || "PENDING";
          return status.toUpperCase() === "DELIVERED";
        });
        
        console.log(`🔍 DEBUG: Checking automatic PO closure - All items delivered: ${allItemsDelivered}`);
        
        if (allItemsDelivered && linesData.length > 0) {
          console.log("✅ All items are delivered, automatically closing PO");
          // Update PO status to CLOSED (assuming status_id 5 is "CLOSED")
          const [autoClosedMaster] = await tx
            .update(poMaster)
            .set({ 
              status_id: 5, // CLOSED status
              updated_on: new Date() 
            })
            .where(eq(poMaster.id, poId))
            .returning();
          
          return autoClosedMaster;
        }
      }
      
      return updatedMaster;
    });
  }

  // Method to create PO in existing po_master and po_lines tables
  async createPoInExistingTables(masterData: any, linesData: any[]): Promise<any> {
    console.log("🔍 DEBUG createPoInExistingTables - masterData received:", masterData);
    console.log("🔍 DEBUG state_id:", masterData.state_id, "district_id:", masterData.district_id);
    
    return await db.transaction(async (tx) => {
      // Find distributor ID by name if serving_distributor is provided
      let distributorId = 1; // Default distributor ID
      if (masterData.serving_distributor) {
        try {
          const distributor = await tx
            .select({ id: distributors.id })
            .from(distributors)
            .where(eq(distributors.name, masterData.serving_distributor))
            .limit(1);
          
          if (distributor.length > 0) {
            distributorId = distributor[0].id;
            console.log(`🔍 DEBUG: Found distributor ID ${distributorId} for name "${masterData.serving_distributor}"`);
          } else {
            // Check if distributor exists in distributor_mst and create it in distributors table
            console.log(`⚠️ WARNING: Distributor "${masterData.serving_distributor}" not found in distributors table`);
            
            const distributorMstEntry = await tx
              .select({ id: distributorMst.id, name: distributorMst.distributor_name })
              .from(distributorMst)
              .where(eq(distributorMst.distributor_name, masterData.serving_distributor))
              .limit(1);
            
            if (distributorMstEntry.length > 0) {
              console.log(`🔍 DEBUG: Found distributor in distributor_mst with ID ${distributorMstEntry[0].id}, creating in distributors table`);
              
              // Create the distributor in distributors table with the same ID
              const [createdDistributor] = await tx
                .insert(distributors)
                .values({
                  id: distributorMstEntry[0].id,
                  name: distributorMstEntry[0].name
                })
                .returning();
              
              distributorId = createdDistributor.id;
              console.log(`✅ Created distributor "${masterData.serving_distributor}" in distributors table with ID ${distributorId}`);
            } else {
              console.log(`⚠️ WARNING: Distributor "${masterData.serving_distributor}" not found in either table, using default ID 1`);
            }
          }
        } catch (error) {
          console.error("Error looking up distributor:", error);
        }
      }

      // Insert into existing po_master table with mapping
      const insertValues = {
        platform_id: masterData.platform_id,
        vendor_po_number: masterData.po_number,
        distributor_id: distributorId,
        series: "PO", // Default series
        company_id: 6, // Jivo Mart company ID  
        po_date: new Date(masterData.po_date),
        status_id: 1, // Default status ID for "OPEN" (1 = Open, 2 = Closed, etc.)
        region: masterData.region,
        area: masterData.area,
        state_id: masterData.state_id || null,
        district_id: masterData.district_id || null,
        dispatch_from: masterData.dispatch_from || null,
        ware_house: masterData.warehouse || null,
        appointment_date: masterData.appointment_date ? new Date(masterData.appointment_date) : null,
        expiry_date: masterData.expiry_date ? new Date(masterData.expiry_date) : null,
        created_by: null // Temporary fix: set to null to avoid foreign key constraint error
      };
      
      console.log("🔍 DEBUG insertValues:", insertValues);
      console.log("🔍 DEBUG specifically - state_id:", insertValues.state_id, "district_id:", insertValues.district_id);
      
      const [createdMaster] = await tx.insert(poMaster).values(insertValues).returning();
      
      // Insert lines into existing po_lines table with proper item mapping
      if (linesData.length > 0) {
        const mappedLines = [];
        
        for (const line of linesData) {
          let platformProductCodeId = 1; // Default fallback
          
          // Debug: Log the entire line object
          console.log(`🔍 DEBUG: Processing line item:`, JSON.stringify(line, null, 2));
          console.log(`🔍 DEBUG: line.platform_code = "${line.platform_code}", line.sap_code = "${line.sap_code}"`);
          
          // Try to find the platform item by platform_code or sap_code
          if (line.platform_code || line.sap_code) {
            const searchCode = line.platform_code || line.sap_code;
            const platformItem = await tx
              .select({ id: pfItemMst.id })
              .from(pfItemMst)
              .where(eq(pfItemMst.pf_itemcode, searchCode))
              .limit(1);
            
            if (platformItem.length > 0) {
              platformProductCodeId = platformItem[0].id;
            } else {
              // Item not found in pf_item_mst, create a new entry
              console.log(`🔍 Item not found in pf_item_mst for code: ${searchCode}, creating new entry`);
              
              // Store full itemcode string directly in sap_id column
              let sapId = null;
              console.log(`🔍 DEBUG: About to process sap_code: "${line.sap_code}" (type: ${typeof line.sap_code})`);
              if (line.sap_code) {
                // Store the full itemcode string directly
                sapId = line.sap_code;
                console.log(`✅ Using full itemcode as sap_id: "${sapId}"`);
              } else {
                console.log(`⚠️ No sap_code provided, using default SAP ID: "DEFAULT"`);
                sapId = "DEFAULT"; // Default fallback SAP ID
              }
              
              console.log(`🔍 DEBUG: Final sapId (full itemcode): "${sapId}"`);
              
              // Create new entry in pf_item_mst
              const newPfItem = {
                pf_itemcode: line.platform_code || line.sap_code || `ITEM_${Date.now()}`,
                pf_itemname: line.item_name,
                pf_id: masterData.platform_id, // Platform ID from master data
                sap_id: sapId // This now contains the integer representation of the itemcode
              };
              
              console.log(`🚀 Creating new pf_item_mst entry:`, JSON.stringify(newPfItem, null, 2));
              console.log(`🔍 DEBUG: Original itemcode "${line.sap_code}" stored as sap_id: ${sapId} (type: ${typeof sapId})`);
              
              try {
                const [createdPfItem] = await tx
                  .insert(pfItemMst)
                  .values(newPfItem)
                  .returning({ id: pfItemMst.id });
                
                platformProductCodeId = createdPfItem.id;
                console.log(`✅ Created new pf_item_mst entry with ID: ${platformProductCodeId}`);
                
                // Verify the insertion
                const verification = await tx
                  .select()
                  .from(pfItemMst)
                  .where(eq(pfItemMst.id, platformProductCodeId))
                  .limit(1);
                console.log(`🔍 VERIFICATION: pf_item_mst record:`, JSON.stringify(verification[0], null, 2));
                console.log(`✅ SUCCESS: Full itemcode "${line.sap_code}" is now stored as sap_id = "${verification[0]?.sap_id}"`);
              } catch (pfItemError) {
                console.error(`❌ Error creating pf_item_mst entry:`, pfItemError);
                throw pfItemError; // Re-throw to see the full error
              }
            }
          }
          
          // Map status name to status ID using helper method
          const statusId = this.mapItemStatusToId(line.status);
          console.log(`🔍 Mapping status "${line.status}" to ID: ${statusId}`);

          mappedLines.push({
            po_id: createdMaster.id,
            platform_product_code_id: platformProductCodeId,
            quantity: line.quantity.toString(),
            basic_amount: line.basic_amount.toString(),
            tax: line.tax_percent ? (parseFloat(line.basic_amount.toString()) * parseFloat(line.tax_percent.toString()) / 100).toString() : "0",
            landing_amount: line.landing_amount ? line.landing_amount.toString() : null,
            total_amount: line.total_amount.toString(),
            uom: line.uom || null,
            total_liter: line.total_ltrs ? line.total_ltrs.toString() : null,
            boxes: line.boxes ? Math.floor(parseFloat(line.boxes.toString())) : null,
            // Invoice fields
            invoice_date: line.invoice_date || null,
            invoice_litre: line.invoice_litre ? line.invoice_litre.toString() : null,
            invoice_amount: line.invoice_amount ? line.invoice_amount.toString() : null,
            invoice_qty: line.invoice_qty ? line.invoice_qty.toString() : null,
            remark: `${line.item_name} - Platform Code: ${line.platform_code} - SAP Code: ${line.sap_code} - Tax Rate: ${line.tax_percent || 0}%`,
            status: statusId, // Use mapped status ID
            delete: false,
            deleted: false
          });
        }
        
        console.log("🔍 DEBUG mappedLines before insert:", JSON.stringify(mappedLines, null, 2));
        
        // Log tax rate preservation for each line
        mappedLines.forEach((line, index) => {
          console.log(`✅ Tax rate preserved for line ${index + 1}: included in remark, calculated tax = ${line.tax}`);
        });
        
        await tx.insert(poLines).values(mappedLines);
      }
      
      return createdMaster;
    });
  }

  // Attachment and Comment functions for all platforms
  
  async addAttachment(platform: string, poId: number, attachmentData: any) {
    const tableMap: Record<string, any> = {
      'zepto': zeptoAttachments,
      'flipkart': flipkartAttachments,
      'blinkit': blinkitAttachments,
      'swiggy': swiggyAttachments,
      'bigbasket': bigbasketAttachments,
      'zomato': zomatoAttachments,
      'dealshare': dealshareAttachments,
      'citymall': citymallAttachments,
      'platform': platformPoAttachments,
      'pf': platformPoAttachments
    };

    const table = tableMap[platform.toLowerCase()];
    if (!table) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const attachments = await db.insert(table).values({
      poId,
      ...attachmentData
    }).returning() as any[];
    
    return attachments[0];
  }

  async getAttachments(platform: string, poId: number) {
    const tableMap: Record<string, any> = {
      'zepto': zeptoAttachments,
      'flipkart': flipkartAttachments,
      'blinkit': blinkitAttachments,
      'swiggy': swiggyAttachments,
      'bigbasket': bigbasketAttachments,
      'zomato': zomatoAttachments,
      'dealshare': dealshareAttachments,
      'citymall': citymallAttachments,
      'platform': platformPoAttachments,
      'pf': platformPoAttachments
    };

    const table = tableMap[platform.toLowerCase()];
    if (!table) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return await db.select().from(table).where(eq(table.poId, poId));
  }

  async deleteAttachment(platform: string, id: number) {
    const tableMap: Record<string, any> = {
      'zepto': zeptoAttachments,
      'flipkart': flipkartAttachments,
      'blinkit': blinkitAttachments,
      'swiggy': swiggyAttachments,
      'bigbasket': bigbasketAttachments,
      'zomato': zomatoAttachments,
      'dealshare': dealshareAttachments,
      'citymall': citymallAttachments,
      'platform': platformPoAttachments,
      'pf': platformPoAttachments
    };

    const table = tableMap[platform.toLowerCase()];
    if (!table) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // First get the attachment to delete the file
    const [attachment] = await db.select().from(table).where(eq(table.id, id));
    
    if (attachment && attachment.filePath) {
      // Delete the physical file
      const fs = await import('fs').then(m => m.promises);
      try {
        await fs.unlink(attachment.filePath);
      } catch (error) {
        console.warn(`Could not delete file: ${attachment.filePath}`, error);
      }
    }

    await db.delete(table).where(eq(table.id, id));
  }

  async addComment(platform: string, poId: number, commentData: any) {
    const tableMap: Record<string, any> = {
      'zepto': zeptoComments,
      'flipkart': flipkartComments,
      'blinkit': blinkitComments,
      'swiggy': swiggyComments,
      'bigbasket': bigbasketComments,
      'zomato': zomatoComments,
      'dealshare': dealshareComments,
      'citymall': citymallComments,
      'platform': platformPoComments,
      'pf': platformPoComments
    };

    const table = tableMap[platform.toLowerCase()];
    if (!table) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const comments = await db.insert(table).values({
      poId,
      ...commentData
    }).returning() as any[];
    
    return comments[0];
  }

  async getComments(platform: string, poId: number) {
    const tableMap: Record<string, any> = {
      'zepto': zeptoComments,
      'flipkart': flipkartComments,
      'blinkit': blinkitComments,
      'swiggy': swiggyComments,
      'bigbasket': bigbasketComments,
      'zomato': zomatoComments,
      'dealshare': dealshareComments,
      'citymall': citymallComments,
      'platform': platformPoComments,
      'pf': platformPoComments
    };

    const table = tableMap[platform.toLowerCase()];
    if (!table) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return await db.select().from(table).where(eq(table.poId, poId)).orderBy(table.createdAt);
  }

  async deleteComment(platform: string, id: number) {
    const tableMap: Record<string, any> = {
      'zepto': zeptoComments,
      'flipkart': flipkartComments,
      'blinkit': blinkitComments,
      'swiggy': swiggyComments,
      'bigbasket': bigbasketComments,
      'zomato': zomatoComments,
      'dealshare': dealshareComments,
      'citymall': citymallComments,
      'platform': platformPoComments,
      'pf': platformPoComments
    };

    const table = tableMap[platform.toLowerCase()];
    if (!table) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    await db.delete(table).where(eq(table.id, id));
  }

  // RBAC Methods Implementation
  
  // Role management
  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(roles.role_name);
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    return result[0];
  }

  async createRole(role: InsertRole): Promise<Role> {
    const result = await db.insert(roles).values(role).returning();
    return result[0];
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role> {
    const result = await db.update(roles)
      .set({ ...role, updated_at: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return result[0];
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Permission management
  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions).orderBy(permissions.category, permissions.permission_name);
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.category, category));
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const result = await db.insert(permissions).values(permission).returning();
    return result[0];
  }

  async updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission> {
    const result = await db.update(permissions)
      .set(permission)
      .where(eq(permissions.id, id))
      .returning();
    return result[0];
  }

  async deletePermission(id: number): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }

  // Role-Permission management
  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    const results = await db.select()
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
      .where(eq(rolePermissions.role_id, roleId));

    return results.map(result => ({
      ...result.role_permissions,
      permission: result.permissions
    })) as RolePermission[];
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    const result = await db.insert(rolePermissions)
      .values({ role_id: roleId, permission_id: permissionId })
      .returning();
    return result[0];
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(
        eq(rolePermissions.role_id, roleId),
        eq(rolePermissions.permission_id, permissionId)
      ));
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user[0]) {
      return [];
    }

    let roleId = user[0].role_id;

    // If user doesn't have role_id but has legacy role field, try to find matching role
    if (!roleId && user[0].role) {
      const matchingRole = await db.select()
        .from(roles)
        .where(eq(roles.role_name, user[0].role));

      if (matchingRole[0]) {
        roleId = matchingRole[0].id;
        // Update user with role_id for future queries
        await db.update(users)
          .set({ role_id: roleId, updated_at: new Date() })
          .where(eq(users.id, userId));
      }
    }

    if (!roleId) {
      return [];
    }

    return await db.select()
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permission_id))
      .where(eq(rolePermissions.role_id, roleId))
      .then(results => results.map(result => result.permissions));
  }

  // User management with roles
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.username);
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<User> {
    const result = await db.update(users)
      .set({ role_id: roleId, updated_at: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getUserWithRole(userId: number): Promise<(User & { role?: Role }) | undefined> {
    const result = await db.select()
      .from(users)
      .leftJoin(roles, eq(users.role_id, roles.id))
      .where(eq(users.id, userId));
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].users,
      role: result[0].roles || undefined
    };
  }

  async getUsersByRole(roleId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role_id, roleId));
  }

  // Session management
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const result = await db.insert(userSessions).values(session).returning();
    return result[0];
  }

  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    const result = await db.select()
      .from(userSessions)
      .where(and(
        eq(userSessions.session_token, sessionToken),
        gte(userSessions.expires_at, new Date())
      ));
    return result[0];
  }

  async deleteUserSession(sessionToken: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.session_token, sessionToken));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(lte(userSessions.expires_at, new Date()));
  }

}

export const storage = new DatabaseStorage();
