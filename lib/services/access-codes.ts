import { databases } from '../appwrite'
import { Query } from 'appwrite'
import { COLLECTIONS, DATABASE_ID } from '../appwrite'

export interface AccessCode {
  $id: string;
  code: string;
  isClaimed: boolean;
  claimedBy?: string; // userId
  claimedAt?: string;
}

class AccessCodeService {
  private db = DATABASE_ID;
  private collectionId = COLLECTIONS.ACCESS_CODES;

  async verifyCode(code: string): Promise<{ isValid: boolean; message: string; codeDetails?: AccessCode }> {
    try {
      const response = await databases.listDocuments(
        this.db,
        this.collectionId,
        [
          Query.equal('code', code.trim()),
        ]
      );

      if (response.documents.length === 0) {
        return { isValid: false, message: "Invalid access code." };
      }

      const accessCode = response.documents[0] as AccessCode;

      if (accessCode.isClaimed) {
        return { isValid: false, message: "This access code has already been used." };
      }

      return { isValid: true, message: "Access code is valid.", codeDetails: accessCode };

    } catch (error) {
      console.error("Error verifying access code:", error);
      return { isValid: false, message: "An error occurred while verifying the code." };
    }
  }

  async claimCode(codeId: string, userId: string): Promise<AccessCode> {
      try {
          const updatedCode = await databases.updateDocument(
              this.db,
              this.collectionId,
              codeId,
              {
                  isClaimed: true,
                  claimedBy: userId,
                  claimedAt: new Date().toISOString(),
              }
          );
          return updatedCode as AccessCode;
      } catch (error) {
          console.error("Error claiming access code:", error);
          throw new Error("Could not claim the access code.");
      }
  }
}

export const accessCodeService = new AccessCodeService();
