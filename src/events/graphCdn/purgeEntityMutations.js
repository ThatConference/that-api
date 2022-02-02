/**
 * The scope here is to define a type to purge and mutation all associate types
 * k
 */
export default {
  purgeMembers: `
    mutation purgeMembers($id: [ID!]) {
      purgeProfile(id: $id)
      purgePublicProfile(id: $id)
      purgePrivateProfile(id: $id)        
    }
  `,
  purgeSessions: `
    mutation purgeSessions($id: [ID!]) {
      purgeRegular(id: $id)
      purgeOpenSpace(id: $id)
      purgeKeynote(id: $id)
      purgePanel(id: $id)
      purgeWorkshop(id: $id)
      purgeAcceptedSession(id: $id)
    }
  `,
  purgeProducts: `
    mutation purgeProducts($id: [ID!]) {
      purgeTicket(id: $id)
      purgeMembership(id: $id)
      purgePartnership(id: $id)
      purgeFood(id: $id)
      purgeCoupon(id: $id)
      purgeTraining(id: $id)
      purgeFamily(id: $id)
    }
  `,
  onCreatedSession: `
    mutation purgeOnCreatedSession($eventId: [ID!], $memberIds: [ID!]) {
      purgeProfile(id: $memberIds)
      purgePublicProfile(id: $memberIds)
      purgePrivateProfile(id: $memberIds)
      purgeEvent(id: $eventId)
    }
  `,
  onCreateProduct: `
    mutation purgeOnCreatedProduct($eventId: [ID!]) {
      purgeEvent(id: $eventId)
    }
  `,
};
