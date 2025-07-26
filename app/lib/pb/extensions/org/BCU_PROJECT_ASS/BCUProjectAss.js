import PBOrg from "@/lib/pb/org";
import { Client, RecordModel } from "pocketbase";

export default class BCUProjectAss {

  constructor(actualExt, pbOrg, pbId) {
    /**
     * @type {PBOrg}
     * */
    this.pbOrg = pbOrg;
    /**
     * @type {Client}
     * */
    this.pb = pbOrg.pb;
    this.pbId = pbId;
    this.actualExt = actualExt;
    this.id = actualExt.id;
    this.name = "Project based Allocation";
  }

  /**
   * 
   * @param {PBOrg} pbOrg 
   * @param {*} config 
   * @returns 
   */
  static async create(actualExt, pbOrg, pbId, config) {
    const ext = new BCUProjectAss(actualExt, pbOrg, pbId);
    return ext;
  }

  /**
   * @param {RecordModel} actualExt
   * @param {PBOrg} pbOrg
   * */
  static async getExt(actualExt, pbOrg) {
    if (!actualExt.enabled) return null;
    const pbId = await pbOrg.getExtPBId(actualExt.id);
    return new BCUProjectAss(actualExt, pbOrg, pbId);
  }

  static requiredPerms() {
    return [];
  }

  async getDesc() {
    return "Allocate members to projects based on their skills.";
  }

  async getMyRequestComponent() {
    return [];
  }

  async getMyProjectRequestComponent(pbProj) {
    return [];
  }
}
