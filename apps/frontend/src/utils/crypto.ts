import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export const decryptSymmetric = (
	key: string,
	ciphertext: string,
	iv: string,
	tag: string,
) => {
	const decipher = createDecipheriv(
		"aes-256-gcm",
		Buffer.from(key, "base64"),
		Buffer.from(iv, "base64"),
	);

	decipher.setAuthTag(Buffer.from(tag, "base64"));

	let plaintext = decipher.update(ciphertext, "base64", "utf8");
	plaintext += decipher.final("utf8");

	return plaintext;
};

export const encryptSymmetric = (key: string, plaintext: string) => {
	const iv = randomBytes(12).toString("base64");
	const cipher = createCipheriv(
		"aes-256-gcm",
		Buffer.from(key, "base64"),
		Buffer.from(iv, "base64"),
	);
	let ciphertext = cipher.update(plaintext, "utf8", "base64");
	ciphertext += cipher.final("base64");
	const tag = cipher.getAuthTag();

	return { ciphertext, iv, tag };
};
