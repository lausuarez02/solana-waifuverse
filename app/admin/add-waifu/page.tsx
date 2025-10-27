"use client";
import { useState } from "react";
import { Button } from "@/components/ui/8bit/button";
import styles from "./page.module.css";

export default function AddWaifuPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingCaptured, setUploadingCaptured] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    lat: -34.6037,
    lng: -58.3816,
    radius: 50000,
    imgUrl: "",
    capturedImgUrl: "",
    rarity: "common",
    emoji: "",
    maxSupply: 100,
    price: "0.001",
    contractTokenId: 1,
    daysActive: 7
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Store password in state for API calls
    setIsAuthenticated(true);
    setMessage("✅ Access granted!");
  }

  async function handleImageUpload(file: File, isCaptured: boolean) {
    if (isCaptured) setUploadingCaptured(true);
    else setUploadingImg(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('waifuId', formData.id || 'temp');
      uploadData.append('isCaptured', isCaptured.toString());
      uploadData.append('adminPassword', password);

      const res = await fetch('/api/admin/upload-waifu-image', {
        method: 'POST',
        body: uploadData
      });

      const data = await res.json();

      if (res.ok) {
        if (isCaptured) {
          setFormData(prev => ({...prev, capturedImgUrl: data.url}));
          setMessage(`✅ Captured image uploaded: ${data.url}`);
        } else {
          setFormData(prev => ({...prev, imgUrl: data.url}));
          setMessage(`✅ Normal image uploaded: ${data.url}`);
        }
      } else {
        setMessage(`❌ Upload failed: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Upload error: ${err}`);
    } finally {
      setUploadingImg(false);
      setUploadingCaptured(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log('Form data before submit:', {
        imgUrl: formData.imgUrl,
        capturedImgUrl: formData.capturedImgUrl
      });

      if (!formData.imgUrl || !formData.capturedImgUrl) {
        setMessage(`❌ Please upload both images first. Normal: ${formData.imgUrl ? 'OK' : 'MISSING'}, Captured: ${formData.capturedImgUrl ? 'OK' : 'MISSING'}`);
        return;
      }

      const now = new Date();
      const endDate = new Date(now.getTime() + formData.daysActive * 24 * 60 * 60 * 1000);

      const waifuData = {
        id: formData.id,
        name: formData.name,
        lat: formData.lat,
        lng: formData.lng,
        radius: formData.radius,
        img: formData.imgUrl,
        capturedImg: formData.capturedImgUrl,
        rarity: formData.rarity,
        emoji: formData.emoji,
        max_supply: formData.maxSupply,
        current_supply: 0,
        spawn_start: now.toISOString(),
        spawn_end: endDate.toISOString(),
        price: formData.price,
        contract_token_id: formData.contractTokenId,
        adminPassword: password
      };

      const res = await fetch('/api/admin/add-waifu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(waifuData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Waifu "${formData.name}" added successfully!`);
        // Reset form
        setFormData({
          id: "",
          name: "",
          lat: -34.6037,
          lng: -58.3816,
          radius: 50000,
          imgUrl: "",
          capturedImgUrl: "",
          rarity: "common",
          emoji: "",
          maxSupply: 100,
          price: "0.001",
          contractTokenId: formData.contractTokenId + 1,
          daysActive: 7
        });
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Failed to add waifu: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Access</h1>
        </div>

        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Admin Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.actions}>
            <Button type="submit" size="lg">
              Login
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Waifu</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Waifu ID *</label>
            <input
              type="text"
              placeholder="w5"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Name *</label>
            <input
              type="text"
              placeholder="Misty"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Emoji *</label>
            <input
              type="text"
              placeholder="💧"
              value={formData.emoji}
              onChange={(e) => setFormData({...formData, emoji: e.target.value})}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Rarity *</label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData({...formData, rarity: e.target.value})}
            >
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Image Uploads */}
        <div className={styles.imageSection}>
          <h3>Waifu Images</h3>

          <div className={styles.imageUpload}>
            <label>Normal Sprite Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, false);
              }}
              disabled={uploadingImg}
            />
            {uploadingImg && <span>Uploading...</span>}
            {formData.imgUrl && (
              <div className={styles.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.imgUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className={styles.imageUpload}>
            <label>Captured Sprite Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, true);
              }}
              disabled={uploadingCaptured}
            />
            {uploadingCaptured && <span>Uploading...</span>}
            {formData.capturedImgUrl && (
              <div className={styles.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.capturedImgUrl} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={formData.lat}
              onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
            />
          </div>

          <div className={styles.field}>
            <label>Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={formData.lng}
              onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
            />
          </div>

          <div className={styles.field}>
            <label>Radius (meters)</label>
            <input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({...formData, radius: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Max Supply *</label>
            <input
              type="number"
              value={formData.maxSupply}
              onChange={(e) => setFormData({...formData, maxSupply: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Price (ETH) *</label>
            <input
              type="text"
              placeholder="0.001"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Days Active</label>
            <input
              type="number"
              value={formData.daysActive}
              onChange={(e) => setFormData({...formData, daysActive: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Contract Token ID *</label>
            <input
              type="number"
              value={formData.contractTokenId}
              onChange={(e) => setFormData({...formData, contractTokenId: parseInt(e.target.value)})}
              required
            />
            <small>The ID used in your smart contract</small>
          </div>
        </div>

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        <div className={styles.actions}>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Adding..." : "Add Waifu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
