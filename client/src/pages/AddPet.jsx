import { useState } from "react";
import { addPet } from "../services/petService";
import Modal from "../components/Modal";
import "../styles/addPet.css";

import { useToast } from "../components/Toast";

const AddPet = () => {
  const toast = useToast();

  const [form, setForm] = useState({
    name: "", breed: "", age: "", city: "",
    type: "", gender: "",
    size: "", color: "", weight: "",
    vaccinated: null,
    trained: null,
    goodWithStrangers: null,
    goodWithKids: null,
    goodWithPets: null,
    healthCondition: "",
    medicalHistory: "",
    temperament: "",
    energyLevel: "",
    diet: "",
    activityNeeds: "",
    reason: "",
    duration: "",
    notes: "",
    adoptionRequirements: ""
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customType, setCustomType] = useState("");
  const [isOtherType, setIsOtherType] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      if (value === "Other") {
        setIsOtherType(true);
        setForm({ ...form, type: "" });
        setCustomType("");
      } else {
        setIsOtherType(false);
        setCustomType("");
        setForm({ ...form, type: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleToggle = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleImage = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.breed || !form.age || !form.city || !form.type || !form.gender) {
      return toast.warn("Please fill all required fields");
    }

    if (!imageFiles.length) {
      return toast.warn("Please upload at least one pet image");
    }

    const updatedForm = {
      ...form,
      vaccinated: form.vaccinated ?? false,
      trained: form.trained ?? false,
      goodWithKids: form.goodWithKids ?? false,
      goodWithPets: form.goodWithPets ?? false,
      goodWithStrangers: form.goodWithStrangers ?? false
    };

    const formData = new FormData();

    Object.keys(updatedForm).forEach((key) => {
      if (updatedForm[key] !== null && updatedForm[key] !== "") {
        formData.append(key, updatedForm[key]);
      }
    });

    imageFiles.forEach((file) => formData.append("images", file));

    try {
      await addPet(formData);
      setShowModal(true);
    } catch {
      toast.error("Error submitting pet registration. Please try again.");
    }
  };

  const handleClose = () => {
    setShowModal(false);
    window.location.href = "/my-pets";
  };

  return (
    <div className="addpet-container">

      <form className="addpet-form" onSubmit={handleSubmit}>

        <h1>Register Your Pet</h1>

        <section>
          <h2>Basic Info</h2>
          <div className="grid">

            <div className="field">
              <label>Pet Name *</label>
              <input name="name" required value={form.name} onChange={handleChange}/>
            </div>

            <div className="field">
              <label>Breed *</label>
              <input name="breed" required value={form.breed} onChange={handleChange}/>
            </div>

            <div className="field">
              <label>Age *</label>
              <input name="age" required value={form.age} onChange={handleChange}/>
            </div>

            <div className="field">
              <label>City *</label>
              <input name="city" required value={form.city} onChange={handleChange}/>
            </div>

            <div className="field">
            <label>Type *</label>

            <select
                name="type"
                required={!isOtherType}
                value={isOtherType ? "Other" : form.type}
                onChange={handleChange}
            >
                <option value="">Select</option>
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
                <option value="Other">Other</option>
            </select>

            {isOtherType && (
                <input
                placeholder="Enter type (e.g., Rabbit, Hamster...)"
                value={customType}
                onChange={(e) => {
                    setCustomType(e.target.value);
                    setForm({ ...form, type: e.target.value });
                }}
                required
                style={{ marginTop: "8px" }}
                />
            )}
            </div>

            <div className="field">
              <label>Gender *</label>
              <select name="gender" required value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

          </div>
        </section>

        <section>
          <h2>Physical</h2>

          <div className="field">
            <label>Size</label>
            <div className="pill-group">
              {["Small","Medium","Large"].map(val => (
                <span key={val}
                  className={form.size===val?"pill active":"pill"}
                  onClick={()=>handleToggle("size",val)}>
                  {val}
                </span>
              ))}
            </div>
          </div>

          <div className="grid">
            <div className="field">
              <label>Color</label>
              <input name="color" value={form.color} onChange={handleChange}/>
            </div>

            <div className="field">
              <label>Weight</label>
              <input name="weight" value={form.weight} onChange={handleChange}/>
            </div>
          </div>
        </section>

        <section>
          <h2>Behavior</h2>

          <div className="row">
            <div className="field">
              <label>Temperament</label>
              <div className="pill-group">
                {["Friendly","Calm","Playful","Protective"].map(val => (
                  <span key={val}
                    className={form.temperament===val?"pill active":"pill"}
                    onClick={()=>handleToggle("temperament",val)}>
                    {val}
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Energy Level</label>
              <div className="pill-group">
                {["Low","Medium","High"].map(val => (
                  <span key={val}
                    className={form.energyLevel===val?"pill active":"pill"}
                    onClick={()=>handleToggle("energyLevel",val)}>
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            <label>Trained</label>
            <div className="toggle-group">
              <button type="button" className={form.trained===true?"active":""}
                onClick={()=>handleToggle("trained",true)}>Yes</button>
              <button type="button" className={form.trained===false?"active":""}
                onClick={()=>handleToggle("trained",false)}>No</button>
            </div>
          </div>
        </section>

        <section>
          <h2>Suitability</h2>

          <div className="row">

            <div className="field">
              <label>Good with Kids</label>
              <div className="toggle-group">
                <button type="button" className={form.goodWithKids===true?"active":""}
                  onClick={()=>handleToggle("goodWithKids",true)}>Yes</button>
                <button type="button" className={form.goodWithKids===false?"active":""}
                  onClick={()=>handleToggle("goodWithKids",false)}>No</button>
              </div>
            </div>

            <div className="field">
              <label>Good with Pets</label>
              <div className="toggle-group">
                <button type="button" className={form.goodWithPets===true?"active":""}
                  onClick={()=>handleToggle("goodWithPets",true)}>Yes</button>
                <button type="button" className={form.goodWithPets===false?"active":""}
                  onClick={()=>handleToggle("goodWithPets",false)}>No</button>
              </div>
            </div>

            <div className="field">
              <label>Good with Strangers</label>
              <div className="toggle-group">
                <button type="button" className={form.goodWithStrangers===true?"active":""}
                  onClick={()=>handleToggle("goodWithStrangers",true)}>Yes</button>
                <button type="button" className={form.goodWithStrangers===false?"active":""}
                  onClick={()=>handleToggle("goodWithStrangers",false)}>No</button>
              </div>
            </div>

          </div>
        </section>

        <section>
          <h2>Lifestyle</h2>

          <div className="field">
            <label>Diet</label>
            <div className="pill-group">
              {["Veg","Non-Veg","Mixed"].map(val => (
                <span key={val}
                  className={form.diet===val?"pill active":"pill"}
                  onClick={()=>handleToggle("diet",val)}>
                  {val}
                </span>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Activity Needs</label>
            <input name="activityNeeds" value={form.activityNeeds} onChange={handleChange}/>
          </div>
        </section>

        <section>
          <h2>Health</h2>

          <div className="field">
            <label>Vaccinated</label>
            <div className="toggle-group">
              <button type="button" className={form.vaccinated===true?"active":""}
                onClick={()=>handleToggle("vaccinated",true)}>Yes</button>
              <button type="button" className={form.vaccinated===false?"active":""}
                onClick={()=>handleToggle("vaccinated",false)}>No</button>
            </div>
          </div>

          <div className="field">
            <label>Health Condition</label>
            <select name="healthCondition" value={form.healthCondition} onChange={handleChange}>
              <option value="">Select</option>
              <option>Healthy</option>
              <option>Minor Issues</option>
              <option>Needs Attention</option>
            </select>
          </div>

          <div className="field">
            <label>Medical History</label>
            <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange}/>
          </div>
        </section>

        <section>
          <h2>Rehoming Details</h2>

          <div className="grid">
            <div className="field">
              <label>Reason for Rehoming</label>
              <input name="reason" value={form.reason} onChange={handleChange} placeholder="e.g., Relocating, allergies, etc." />
            </div>
            <div className="field">
              <label>Duration Owned</label>
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g., 2 years, since puppy" />
            </div>
          </div>

          <div className="field">
            <label>Additional Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any extra details about the pet..."/>
          </div>

          <div className="field">
            <label>Adoption Requirements</label>
            <textarea name="adoptionRequirements" value={form.adoptionRequirements} onChange={handleChange} placeholder="What you expect from the adopter..."/>
          </div>
        </section>

        <section>
          <h2>Photos (up to 4)</h2>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>First photo will be the main display image.</p>
          <input type="file" onChange={handleImage} accept="image/*" multiple />
          {previews.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Preview ${i + 1}`}
                  style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "10px", border: "2px solid #ff6f5e" }}
                />
              ))}
            </div>
          )}
        </section>

        <button type="submit">Submit</button>

      </form>

      {showModal && <Modal message="Submitted successfully" onClose={handleClose}/>}

    </div>
  );
};

export default AddPet;