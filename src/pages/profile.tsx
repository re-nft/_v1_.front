import React, { useCallback, useState, useEffect } from "react";
import { updateUserData } from "renft-front/services/firebase";
import CatalogueLoader from "renft-front/components/common/catalogue-loader";
import { useLookupAddress } from "renft-front/hooks/queries/useLookupAddress";
import { Button } from "renft-front/components/common/button";
import { CatalogueItemRow } from "renft-front/components/catalogue-item/catalogue-item-row";
import { TextField } from "renft-front/components/common/text-field";
import { TextArea } from "renft-front/components/common/textarea";
import { ShortenPopover } from "renft-front/components/common/shorten-popover";
import { useUserData } from "renft-front/hooks/store/useUserData";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";

const Profile: React.FC = () => {
  const { userData, isLoading, refreshUserData } = useUserData();
  const currentAddress = useCurrentAddress();
  const lookupName = useLookupAddress();
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const { signer } = useWallet();

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (username !== "" || bio !== "") {
        updateUserData(currentAddress, username, bio)
          .then(refreshUserData)
          .catch(() => {
            console.warn("could not update user data");
          });
      }
    },
    [username, bio, currentAddress, refreshUserData]
  );

  const handleChangeFormField = useCallback((e: React.ChangeEvent<unknown>) => {
    // @ts-ignore
    if (e.target.name === "username") {
      // @ts-ignore
      setUsername(e.target.value);
    }
    // @ts-ignore
    if (e.target.name === "bio") {
      // @ts-ignore
      setBio(e.target.value);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setUsername(userData?.name || "");
      setBio(userData?.bio || "");
    }
  }, [userData]);

  if (!signer) {
    return (
      <div className="text-center text-base text-white font-display py-32 leading-tight">
        Please connect your wallet!
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto">
        <CatalogueLoader />
      </div>
    );
  }

  return (
    <div className="flex relative flex-col py-4 min-h-screen w-full">
      <div className="mx-auto py-4 px-6 w-80 text-xl flex flex-col space-y-2">
        <div className="text-white">
          <CatalogueItemRow
            text="Username"
            value={userData?.name || "Unnamed"}
          />
          <CatalogueItemRow
            text="Address"
            value={<ShortenPopover longString={currentAddress} />}
          />
          <CatalogueItemRow
            text="Reverse address"
            value={<ShortenPopover longString={lookupName || "none"} />}
          />
        </div>

        <form
          noValidate
          autoComplete="off"
          onSubmit={onSubmit}
          className="flex flex-col space-y-2 p-4"
        >
          <TextField
            required
            label="Username"
            id="username"
            name="username"
            value={userData?.name || ""}
            onChange={handleChangeFormField}
            onBlur={handleChangeFormField}
          />
          <TextArea
            required
            label="Bio"
            id="bio"
            name="bio"
            value={bio}
            onChange={handleChangeFormField}
            onBlur={handleChangeFormField}
            rows={6}
          />
          <div className="flex justify-center items-center p-4">
            <Button onClick={onSubmit} description="Save" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
