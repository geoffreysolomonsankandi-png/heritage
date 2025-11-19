// In: graphql/typeDefs.js

const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar Upload

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
  }
  
  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type Location {
    id: ID!
    name: String!
    description: String!
    aiSummary: String
    imageUrl: String!
    status: String!
    submittedBy: User!
    coordinates: Coordinates!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type SiteImage {
    id: ID!
    key: String!
    imageUrl: String!
    description: String
  }

  type TextContent {
    id: ID!
    key: String!
    content: String!
    page: String
    description: String
  }

  type HistoricalEvent {
    id: ID!
    month: Int!
    day: Int!
    title: String!
    description: String!
    imageUrl: String!
    link: String
    isFeatured: Boolean
  }

  type QRCode {
    id: ID!
    dataUrl: String!
  }
  
  type Query {
    hello: String
    getAllLocations(status: String): [Location!]
    getPendingLocations: [Location!]
    getSiteImages: [SiteImage!]
    getTextContents: [TextContent!]
    getHistoricalEvents: [HistoricalEvent!]
    getComments(locationId: ID!): [Comment!]
    getQrCodeForLocation(locationId: ID!): QRCode
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    submitLocation(name: String!, description: String!, imageUrl: String!, lat: Float!, lng: Float!): Location!
    approveLocation(locationId: ID!): Location!
    addComment(locationId: ID!, text: String!): Comment!
    uploadSiteImage(key: String!, description: String, file: Upload!): SiteImage!
    deleteSiteImage(key: String!): SiteImage
    updateTextContent(key: String!, content: String!, page: String, description: String): TextContent!
    addHistoricalEvent(month: Int!, day: Int!, title: String!, description: String!, imageUrl: String!, link: String): HistoricalEvent!
    updateHistoricalEvent(id: ID!, month: Int, day: Int, title: String, description: String, imageUrl: String, link: String): HistoricalEvent!
    deleteHistoricalEvent(id: ID!): HistoricalEvent
    setFeaturedEvent(id: ID!): HistoricalEvent!
    unsetFeaturedEvent: HistoricalEvent

    # --- NEW MUTATION FOR INTERACTIVE SCANNING ---
    generateTownScanQrCode(townName: String!, clientId: String!): QRCode!
  }
`;