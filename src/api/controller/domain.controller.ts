import { RecordJSON } from "adminjs";
import { prisma } from "../../model/prisma.js";

export class DomainApiController {
  me = async (req, res) => {
    const user = (req.session as any)?.adminUser;
    if (!user) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    var listDomain = await prisma.userHasDomain.findMany({
        where: { userId: Number(user.id) },
        include: { domain: true },
      });
    
      let domainData: RecordJSON[];
    
      if (listDomain.length > 0) {
        domainData = listDomain.map((domain) => ({
          params: {
            id: domain.domainId,
            name: domain.domain.url,
          },
          id: domain.domainId.toString(),
          populated: {},
          baseError: null,
          bulkActions: [],
          errors: {},
          populatedVer: 0,
          recordActions: [],
          title: domain.domain.url,
        }));
      } else {
        domainData = [];
      } 
    res.json(domainData);
  };
}
